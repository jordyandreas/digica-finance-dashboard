import { NextResponse } from "next/server";
import { getTodayDateString } from "@/lib/date-utils";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  getOfferForPackage,
  isPackageForSource,
  isRegistrationSource,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";
import {
  paidParticipantRegistrationSchema,
  participantRegistrationSchema,
} from "@/schemas/participant-registration-schema";
import { getProgramRegistrationPublicData } from "@/services/program-share-metadata.service";
import { normalizeParticipantPhoneForSubmit } from "@/utils/phone";
import { isRegistrationClosed } from "@/utils/program-public";
import { resolveProgramIdByIdentifier } from "@/utils/program-public-link";

interface RegistrationRouteParams {
  params: Promise<{ programId: string }>;
}

export async function GET(
  _request: Request,
  { params }: RegistrationRouteParams,
) {
  try {
    const { programId: identifier } = await params;
    const program = await getProgramRegistrationPublicData(identifier);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Registration GET error:", error);
    return NextResponse.json(
      { error: "Failed to load registration data" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RegistrationRouteParams,
) {
  try {
    const { programId: identifier } = await params;
    const supabase = createAdminClient();
    const resolvedProgramId = await resolveProgramIdByIdentifier(
      supabase,
      identifier,
    );

    if (!resolvedProgramId) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = await getProgramRegistrationPublicData(identifier);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (
      isRegistrationClosed({
        status: program.status,
        start_date: program.start_date,
        end_date: program.end_date,
      })
    ) {
      return NextResponse.json(
        {
          error:
            "This program has completed and is no longer accepting registrations",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const isPaidProgram =
      program.type === "bootcamp" || program.type === "mini_bootcamp";

    if (isPaidProgram) {
      const validation = paidParticipantRegistrationSchema.safeParse(body);

      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        return NextResponse.json(
          { error: firstIssue?.message || "Invalid registration payload" },
          { status: 400 },
        );
      }

      const values = validation.data;
      const source = values.registration_source as RegistrationSource;
      const selectedPackage = values.selected_package as RegistrationPackage;
      const offerPrices = {
        promo_individual_price: program.promo_individual_price,
        promo_bareng_teman_price: program.promo_bareng_teman_price,
        price: program.price,
      };

      if (
        !isRegistrationSource(source) ||
        !isPackageForSource(source, selectedPackage, offerPrices)
      ) {
        return NextResponse.json(
          { error: "Invalid registration source or package" },
          { status: 400 },
        );
      }

      const offer = getOfferForPackage(source, selectedPackage, offerPrices);
      if (!offer) {
        return NextResponse.json(
          { error: "Invalid registration package" },
          { status: 400 },
        );
      }

      const { error } = await supabase.from("participants").insert({
        name: values.name.trim().toLowerCase(),
        email: values.email.trim().toLowerCase(),
        phone: normalizeParticipantPhoneForSubmit(values.phone),
        occupation: values.occupation || null,
        organization: values.organization?.trim().toLowerCase() || null,
        program_id: resolvedProgramId,
        status: "active",
        joined_date: getTodayDateString(),
        registration_source: source,
        selected_package: selectedPackage,
        package_price: offer.price,
        friend_name:
          selectedPackage === "bareng_teman"
            ? values.friend_name?.trim().toLowerCase() || null
            : null,
        friend_phone:
          selectedPackage === "bareng_teman" && values.friend_phone
            ? normalizeParticipantPhoneForSubmit(values.friend_phone)
            : null,
      });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        package_price: offer.price,
        selected_package: selectedPackage,
        registration_source: source,
      });
    }

    const validation = participantRegistrationSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid registration payload" },
        { status: 400 },
      );
    }

    const values = validation.data;
    const { error } = await supabase.from("participants").insert({
      name: values.name.trim().toLowerCase(),
      email: values.email.trim().toLowerCase(),
      phone: normalizeParticipantPhoneForSubmit(values.phone),
      occupation: values.occupation || null,
      organization: values.organization?.trim().toLowerCase() || null,
      program_id: resolvedProgramId,
      status: "active",
      joined_date: getTodayDateString(),
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit registration" },
      { status: 500 },
    );
  }
}
