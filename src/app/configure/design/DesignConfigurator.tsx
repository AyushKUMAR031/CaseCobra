"use client"
//rnd requires user interaction hence this page is heavily client side

import HandleComponent from "@/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import NextImage from "next/image";
import {Rnd} from 'react-rnd'
import { RadioGroup } from "@headlessui/react"
import { useRef, useState } from "react";
import { COLORS, FINISHES, MATERIALS, MODELS } from "@/validators/option-validator";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { BASE_PRICE } from "@/config/product";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { saveConfig as _saveConfig, SaveConfigArgs } from "./actions";
import { useRouter } from "next/navigation";

interface DesignConfiguratorProps{
    configId: string;
    imageUrl: string;
    imageDimensions: {width: number, height: number};
}
const DesignConfigurator = ({configId, imageUrl, imageDimensions}: DesignConfiguratorProps) =>{

    const {toast} = useToast();
    const router = useRouter();

    //useMutation hook for saving the configuration.
    //and redirecting to the third step.
    const {mutate: saveConfig} = useMutation({
        mutationKey: ["save-config"],
        mutationFn: async (args: SaveConfigArgs) => {
            // Save the config to the database
            await Promise.all([saveConfiguration(), _saveConfig(args)])
        },
        onError: () => {
            toast({
                title: 'Something went wrong',
                description: 'There was an error on our end. Please try again',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            router.push(`/configure/previews?id=${configId}`)
        },
    })

    const [options, setOptions] = useState<{
        color: (typeof COLORS)[number];
        model: (typeof MODELS.options)[number];
        material: (typeof MATERIALS.options)[number];
        finish: (typeof FINISHES.options)[number];
    }>({
        color: COLORS[0],
        model: MODELS.options[0],
        material: MATERIALS.options[0],
        finish: FINISHES.options[0],
    })

    const [renderedDimension, setRenderedDimension] = useState(
        {
            width: imageDimensions.width/4,
            height: imageDimensions.height/4,
        }
    )

    //what is the cropped the image position and dimension
    const [renderedPosition, setRenderedPosition] = useState({
        x: 150,
        y: 205,
    })

    const phoneCaseRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const {startUpload} = useUploadThing('imageUploader');
    
    //for any screen size and ratio it will config the image position and dimension w.r.t phone case
    async function saveConfiguration() {
        try{
            // ! -> for clearing specifing that their is phonecaseref.current or not
            const {left: caseLeft, top: caseTop, width, height} = phoneCaseRef.current!.getBoundingClientRect()
            // similar for container from the web page display
            const {left: containerLeft, top: containerTop} = containerRef.current!.getBoundingClientRect()

            // diagonal symmetry of the phone case
            const leftOffset = caseLeft - containerLeft;
            const topOffset = caseTop - containerTop;
            
            const actualX = renderedPosition.x - leftOffset; //indirectly from the user Screen view 
            const actualY = renderedPosition.y - topOffset;


            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            const userImage = new Image();
            userImage.crossOrigin = 'anonymous';
            userImage.src = imageUrl;
            await new Promise((resolve, reject) => (userImage.onload = resolve));

            ctx?.drawImage(
                userImage, //source image
                actualX, //x position of the source image
                actualY, //y position of the source image
                renderedDimension.width, //width of the source image
                renderedDimension.height, //height of the source image
            )

            //converting the image from HTML to base64 format
            const base64 = canvas.toDataURL();
            // console.log(base64);

            //splitting the base64 data from the image
            const base64Data = base64.split(',')[1];

            //converting the base64 data to blob format and storing it
            const blob = base64ToBlob(base64Data, 'image/png');
            const file = new File([blob], 'filename.png', {type: 'image/png'});

            await startUpload([file], {configId});
        }catch(err){
            toast({
                title: 'Something went wrong',
                description: 'There was a problem saving your config, Please try again',
                variant: 'destructive',
            })
        }
    }

    //string to blob conversion
    function base64ToBlob(base64: string, type: string){
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for(let i=0; i<byteCharacters.length; i++){
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers); //so that we can now convert into a blob element
        return new Blob([byteArray], {type: type});
    }


    return (
        <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20">
            <div ref={containerRef} className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
                {/* adding a part of phone reference positon in the AspectRatio */}
                    <AspectRatio ref={phoneCaseRef} ratio={896/1831} className="pointer-events-none relative z-50 aspect-[896/1831] w-full">
                        <NextImage 
                            fill
                            alt='phone image' src="/phone-template.png" className="pointer-events-none z-50 select-none"
                        />
                    </AspectRatio>
                    {/* the below div is basic for graying the extra part over the phone and highligthing the main part of the cropped photo */}
                    <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]"/>
                    {/* this div below is the part of dynamic change in color of the phone cover */}
                    <div className={cn("absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]", `bg-${options.color.tw}`)}/>
                    {/* finally fixed on the custom color of the case */}
                </div>

                {/* this rnd default -> help with the initial position of the image uploaded */}
                <Rnd default={{
                    x: 150,
                    y: 205,
                    height: imageDimensions.height /4,
                    width: imageDimensions.width /4,
                }}
                // for resizing the cropped image as per the user
                onResizeStop={(_,__, ref, ___, {x,y}) => {
                    setRenderedDimension({
                        height: parseInt(ref.style.height.slice(0,-2)),
                        width: parseInt(ref.style.width.slice(0,-2)),
                    })

                    setRenderedPosition({x,y})
                }}
                // for moving the cropped image as per the user (basically not cropping but draging)
                onDragStop={(_, data) => {
                    const {x,y} = data
                    setRenderedPosition({x,y})
                }}

                className="absolute z-20 border-[3px] border-primary"
                lockAspectRatio
                resizeHandleComponent={{
                    bottomRight: <HandleComponent/>,
                    bottomLeft: <HandleComponent/>,
                    topRight: <HandleComponent/>,
                    topLeft: <HandleComponent/>,
                }}>

                {/* to resizing techniques we use -> resizeHandlecomponent */}
                    <div className="relative w-full h-full">
                        <NextImage src={imageUrl} fill alt="your image" className="pointer-events-none"/>
                    </div>
                </Rnd>
            </div>

            <div className="h-[37.5rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
                <ScrollArea className="relative flex-1 overflow-auto">
                    <div aria-hidden="true" className="absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none"/>
                    <div className="px-8 pb-12 pt-8">

                        <h2 className="tracking-tight font-bold text-3xl">Customize your case</h2>
                        <div className="w-full h-px bg-zinc-200 my-6"/>

                        <div className='relative mt-4 h-full flex flex-col justify-between'>
                            <div className='flex flex-col gap-6'>
                                
                                {/* <RadioGroup
                                    value={options.color}
                                    onChange={(val) => {
                                        setOptions((prev) => ({
                                        ...prev,
                                        color: val,
                                        }))
                                    }}>
                                    <Label>Color: {options.color.label}</Label>
                                    <div className='mt-3 flex items-center space-x-3'>
                                        {COLORS.map((color) => (
                                        <RadioGroup.Option
                                            key={color.label}
                                            value={color}
                                            className={({ active, checked }) =>
                                            cn(
                                                'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent',
                                                {
                                                [`border-${color.tw}`]: active || checked,
                                                }
                                            )
                                            }>
                                            <span
                                            className={cn(
                                                `bg-${color.tw}`,
                                                'h-8 w-8 rounded-full border border-black border-opacity-10'
                                            )}
                                            />
                                        </RadioGroup.Option>
                                        ))}
                                    </div>
                                </RadioGroup> */}


                                {/* trying the const for the dynamic change in color */}
                                <RadioGroup
                                value={options.color}
                                onChange={(val) => {
                                    setOptions((prev) => ({
                                    ...prev,
                                    color: val,
                                    }));
                                }}
                                >
                                <Label>Color: {options.color.label}</Label>
                                <div className='mt-3 flex items-center space-x-3'>
                                    {COLORS.map((color) => {
                                    const borderColorClass = color.tw === 'zinc-900' ? 'border-zinc-900' : color.tw === 'blue-950' ? 'border-blue-950' : 'border-rose-950';
                                    const bgColorClass = color.tw === 'zinc-900' ? 'bg-zinc-900' : color.tw === 'blue-950' ? 'bg-blue-950' : 'bg-rose-950';

                                    return (
                                        <RadioGroup.Option
                                        key={color.label}
                                        value={color}
                                        className={({ active, checked }) =>
                                            cn(
                                            'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparent',
                                            {
                                                [borderColorClass]: active || checked,
                                            }
                                            )
                                        }
                                        >
                                        <span
                                            className={cn(
                                            bgColorClass,
                                            'h-8 w-8 rounded-full border border-black border-opacity-10'
                                            )}
                                        />
                                        </RadioGroup.Option>
                                    );
                                    })}
                                </div>
                                </RadioGroup>

                                {/* The loosly fixed part
                                <RadioGroup>
                                    <div className='mt-3 flex items-center space-x-3'> 
                                        <span
                                            className='bg-zinc-900 h-8 w-8 rounded-full border border-black border-opacity-10'
                                        />
                                        <span
                                            className='bg-blue-900 h-8 w-8 rounded-full border border-black border-opacity-10'
                                        /> 
                                        <span
                                        className='bg-rose-900 h-8 w-8 rounded-full border border-black border-opacity-10'
                                        /> 
                                    </div>
                                </RadioGroup> */}

                                <div className='relative flex flex-col gap-3 w-full'>
                                    <Label>Model</Label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='outline'
                                                role='combobox'
                                                className='w-full justify-between'>
                                                {options.model.label}
                                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent>
                                            {MODELS.options.map((model) => (
                                            <DropdownMenuItem key={model.label} className={cn('flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100',
                                                {
                                                'bg-zinc-100':
                                                    model.label === options.model.label,
                                                }
                                                )}
                                                onClick={() => {
                                                    setOptions((prev) => ({ ...prev, model }))
                                                }}>

                                                <Check
                                                    className={cn(
                                                    'mr-2 h-4 w-4', model.label === options.model.label ? 'opacity-100': 'opacity-0'
                                                    )}
                                                />

                                                {model.label}
                                            </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>


                                {[MATERIALS, FINISHES].map(({name,options: selectableOptions}) => (
                                    <RadioGroup key={name} value={options[name]} 
                                        onChange={(val) => {
                                        setOptions((prev) => ({...prev,[name]: val,}))
                                    }}>
                                        <Label>
                                            {name.slice(0,1).toUpperCase() + name.slice(1)}
                                        </Label>
                                        <div className='mt-3 space-y-4'>
                                            {selectableOptions.map((option) => (
                                                <RadioGroup.Option key={option.value} value={option} 
                                                    className={({ active, checked }) => cn('relative block cursor-pointer rounded-lg bg-white px-6 py-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between',
                                                    {'border-primary': active || checked,})
                                                }>
                                                    <span className='flex items-center'>
                                                        <span className='flex flex-col text-sm'>
                                                            <RadioGroup.Label className='font-medium text-gray-900' as='span'>
                                                                {option.label}
                                                            </RadioGroup.Label>

                                                            {option.description ? (
                                                                <RadioGroup.Description as='span' className='text-gray-500'>
                                                                    <span className='block sm:inline'>
                                                                        {option.description}
                                                                    </span>
                                                                </RadioGroup.Description>
                                                            ) : null}
                                                        </span>
                                                    </span>

                                                    <RadioGroup.Description as='span' className='mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right'>
                                                        <span className='font-medium text-gray-900'>
                                                            {formatPrice(option.price / 100)}
                                                        </span>
                                                    </RadioGroup.Description>
                                                </RadioGroup.Option>
                                                ))
                                            }
                                        </div>                                    
                                    </RadioGroup>
                                ))} 
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className='w-full px-8 h-16 bg-white'>
                    <div className='h-px w-full bg-zinc-200' />
                    <div className='w-full h-full flex justify-end items-center'>
                        <div className='w-full flex gap-6 items-center'>
                            <p className='font-medium whitespace-nowrap'>
                                {formatPrice((BASE_PRICE + options.finish.price + options.material.price) / 100)}
                            </p>
                            <Button onClick={() => saveConfig({
                                configId, 
                                color: options.color.value,
                                finish: options.finish.value,
                                material: options.material.value,
                                model: options.model.value,
                                })}
                                size='sm'
                                className='w-full'>
                                Continue
                                <ArrowRight className='h-4 w-4 ml-1.5 inline' />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DesignConfigurator;