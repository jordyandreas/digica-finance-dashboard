"use client";

import * as React from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface ArticleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function isEmptyHtml(value: string): boolean {
  const normalized = value.replace(/\s+/g, "").toLowerCase();
  return normalized === "" || normalized === "<p></p>";
}

export function ArticleRichTextEditor({
  value,
  onChange,
  placeholder = "Write the article body...",
}: ArticleRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] rounded-b-xl px-4 py-3 text-sm text-foreground focus:outline-none [&_blockquote]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-4 [&_ol>li]:list-decimal [&_p]:mb-2 [&_ul>li]:list-disc",
      },
    },
    onUpdate: ({ editor: nextEditor }) => {
      const html = nextEditor.getHTML();
      onChange(isEmptyHtml(html) ? "" : html);
    },
  });

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    const currentValue = isEmptyHtml(editor.getHTML()) ? "" : editor.getHTML();
    const nextValue = value || "";

    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue || "<p></p>", {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="min-h-[280px] rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <div className="flex flex-wrap gap-2 border-b p-3">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
          Bold
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
          Italic
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 2 }) ? "secondary" : "outline"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
          H2
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 3 }) ? "secondary" : "outline"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
          H3
        </Button>
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
          Ordered
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
          Quote
        </Button>
        <Button
          type="button"
          variant={editor.isActive("link") ? "secondary" : "outline"}
          size="sm"
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
          Link
        </Button>
      </div>
      <div className={cn("max-w-none")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
