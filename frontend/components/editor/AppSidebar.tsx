import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FileCode, FileJson, FileType } from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeFile: "html" | "css" | "js";
  onFileSelect: (file: "html" | "css" | "js") => void;
}

export function AppSidebar({
  activeFile,
  onFileSelect,
  ...props
}: AppSidebarProps) {
  const files = [
    {
      id: "html",
      name: "index.html",
      icon: FileCode,
      color: "text-orange-500",
    },
    {
      id: "css",
      name: "style.css",
      icon: FileType,
      color: "text-blue-500",
    },
    {
      id: "js",
      name: "script.js",
      icon: FileJson,
      color: "text-yellow-500",
    },
  ] as const;

  return (
    <Sidebar collapsible="icon" className="bg-card" {...props}>
      <SidebarHeader className="h-[72px] border-b border-border bg-card flex items-center justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <img
            src="/inline_logo.svg"
            alt="Coil Code Logo"
            className="w-auto h-5"
          />
          <span className="font-semibold text-foreground">Coil Code Editor</span>
        </div>
        <div className="hidden group-data-[collapsible=icon]:block">
          <img
            src="/inline_logo.svg"
            alt="Coil Code Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground">Files</SidebarGroupLabel>
          <SidebarGroupContent className="bg-card">
            <SidebarMenu>
              {files.map((file) => (
                <SidebarMenuItem key={file.id}>
                  <SidebarMenuButton
                    className="data-[active=true]:bg-muted"
                    onClick={() => onFileSelect(file.id)}
                    isActive={activeFile === file.id}
                  >
                    <file.icon className={file.color} />
                    <span className="text-foreground">{file.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
