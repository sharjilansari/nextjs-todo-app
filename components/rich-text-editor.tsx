"use client"

import { useState, useEffect } from "react"
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)

    // Get the updated HTML content and call onChange
    const editorContent = document.getElementById("rich-text-editor")?.innerHTML || ""
    onChange(editorContent)
  }

  // Format buttons with their commands
  const formatButtons = [
    { icon: <Bold className="h-4 w-4" />, command: "bold", title: "Bold" },
    { icon: <Italic className="h-4 w-4" />, command: "italic", title: "Italic" },
    { icon: <List className="h-4 w-4" />, command: "insertUnorderedList", title: "Bullet List" },
    { icon: <ListOrdered className="h-4 w-4" />, command: "insertOrderedList", title: "Numbered List" },
    { icon: <AlignLeft className="h-4 w-4" />, command: "justifyLeft", title: "Align Left" },
    { icon: <AlignCenter className="h-4 w-4" />, command: "justifyCenter", title: "Align Center" },
    { icon: <AlignRight className="h-4 w-4" />, command: "justifyRight", title: "Align Right" },
  ]

  if (!isMounted) {
    return <div className="h-32 border rounded-md bg-muted/20 animate-pulse" />
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <div className="bg-muted/20 p-1 border-b flex flex-wrap gap-1">
        {formatButtons.map((button, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => execCommand(button.command)}
            title={button.title}
            type="button"
          >
            {button.icon}
          </Button>
        ))}
      </div>
      <div
        id="rich-text-editor"
        contentEditable
        className="p-3 min-h-[150px] focus:outline-none"
        dangerouslySetInnerHTML={{ __html: value }}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  )
}

