"use client"
//rnd requires user interaction hence this page is heavily client side

import HandlComponent from "@/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import {Rnd} from 'react-rnd'
interface DesignConfigurationProps{
    configId: string;
    imageUrl: string;
    imageDimensions: {width: number, height: number};
}
const DesignConfigurator = ({configId, imageUrl, imageDimensions}: DesignConfigurationProps) =>{
    return (
        <div className="relative mt-20 grid grid-cols-3 mb-20 pb-20">
            <div className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
                    <AspectRatio ratio={896/1831} className="pointer-events-none relative z-50 aspect-[896/1831] w-full">
                        <NextImage 
                            fill
                            alt='phone image' src="/phone-template.png" className="pointer-events-none z-50 select-none"
                        />
                    </AspectRatio>
                    {/* the below div is basic for graying the extra part over the phone and highligthing the main part of the cropped photo */}
                    <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]"/>
                    {/* this div below is the part of dynamic change in color of the phone cover */}
                    <div className={cn("absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]",`bg-blue-950`)}/>
                </div>
                {/* this rnd default -> help with the initial position of the image uploaded */}
                <Rnd default={{
                    x: 150,
                    y: 205,
                    height: imageDimensions.height /4,
                    width: imageDimensions.width /4,
                }}
                className="absolute z-20 border-[3px] border-primary"
                lockAspectRatio
                resizeHandleComponent={{
                    bottomRight: <HandlComponent/>,
                    bottomLeft: <HandlComponent/>,
                    topRight: <HandlComponent/>,
                    topLeft: <HandlComponent/>,
                }}>
                {/* to resizing techniques we use -> resizeHandlecomponent */}
                    <div className="relative w-full h-full">
                        <NextImage src={imageUrl} fill alt="your image" className="pointer-events-none"/>
                    </div>
                </Rnd>
            </div>

            <div className="h-[37.5rem] flex flex-col bg-white"></div>
        </div>
    )
}

export default DesignConfigurator;