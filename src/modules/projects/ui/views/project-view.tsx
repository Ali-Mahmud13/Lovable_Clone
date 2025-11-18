"use client"

import { useTRPC } from "@/trpc/client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup  } from "@/components/ui/resizable";
import {MessagesContainer} from "../components/messages-container"
interface Props{
 projectId: string
}

export const ProjectView= ({projectId}: Props)=>{
const trpc = useTRPC();

return(
    <div className="h-screen">
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={35} minSize={20}>
                    <MessagesContainer projectId={projectId}/>
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel defaultSize={65} minSize={50}>
                    TODO: Preview
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
)

}