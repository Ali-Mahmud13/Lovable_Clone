"use client"

import { useTRPC } from "@/trpc/client"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup  } from "@/components/ui/resizable";
import {MessagesContainer} from "../components/messages-container"
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma/wasm";
import { ProjectHeader } from "../components/project-header";



interface Props{
 projectId: string
}

export const ProjectView= ({projectId}: Props)=>{
const trpc = useTRPC();
const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

return(
    <div className="h-screen">
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={35} minSize={20}>
                <div className="flex flex-col h-full">
                    <Suspense fallback={<div>Loading Project...</div>}>
                        <ProjectHeader projectId={projectId}/>
                    </Suspense>
                    <Suspense fallback={<div>Loading Messages...</div>}>
                        <MessagesContainer 
                        projectId={projectId}
                        activeFragment={activeFragment}
                        setActiveFragment={setActiveFragment}
                        />
                    </Suspense>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle/>
            <ResizablePanel defaultSize={65} minSize={50}>
                    TODO: Preview
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
)

}