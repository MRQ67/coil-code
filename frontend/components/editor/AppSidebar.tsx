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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-[72px] border-b border-[#3C3C3C] flex items-center justify-center group-data-[collapsible=icon]:px-0">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <img
            src="/inline_logo.svg"
            alt="Coil Code Logo"
            className="w-auto h-5"
          />
          <span className="font-semibold text-[#CCCCCC]">Coil Code Editor</span>
        </div>
        <div className="hidden group-data-[collapsible=icon]:block">
          <img
            src="/inline_logo.svg"
            alt="Coil Code Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {files.map((file) => (
                <SidebarMenuItem key={file.id}>
                  <SidebarMenuButton
                    onClick={() => onFileSelect(file.id)}
                    isActive={activeFile === file.id}
                    className="data-[active=true]:bg-[#393E46] data-[active=true]:text-white hover:bg-[#948979] hover:text-white"
                  >
                    <file.icon className={file.color} />
                    <span>{file.name}</span>
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
