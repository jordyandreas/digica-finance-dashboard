"use client";

import * as React from "react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Bold, Heading2, Italic, List } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function isEmptyHtml(value: string): boolean {
  const normalized = value.replace(/\s+/g, "").toLowerCase();
  return normalized === "" || normalized === "<p></p>";
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[180px] rounded-b-xl px-4 py-3 text-sm text-foreground focus:outline-none [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2",
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

  if (!editor) {
    return (
      <div className="min-h-[180px] rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
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
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "outline"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
          Heading
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
      </div>
      <div className={cn("max-w-none")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
