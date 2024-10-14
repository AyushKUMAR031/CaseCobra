interface DesignConfigurationProps{
    configId: string;
    imageUrl: string;
    imageDimensions: {width: number, height: number};
}
const DesignConfigurator = ({configId, imageUrl, imageDimensions}: DesignConfigurationProps) =>{
    return (
        <div className="relative mt-20 grid grid-cols-3 mb-20 pb-20">
            <div className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <div className=""></div>
            </div>
        </div>
    )
}

export default DesignConfigurator;