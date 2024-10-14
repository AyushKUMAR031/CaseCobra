import { db } from "@/db";
import { notFound } from "next/navigation";
import DesignConfigurator from "./DesignConfigurator";

interface PageProps {
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}
//in next there is a default paramenter called searchParams
//so we are using an interface with the default param.

const Page = async ({searchParams}: PageProps) => {
    //making a db call in server for static html for client
    const {id} = searchParams;

    if(!id || typeof id !== "string"){ 
        return notFound(); //this part is basically used to check if someone doesn't open the page direct
        //or the file type is not matched with the string
    }

    const configuration = await db.configuration.findUnique({
        where: { id },
    })

    if(!configuration){
        return notFound();
    }

    //destructuring the configration from db into the required paramemters.
    const {imageUrl, width, height} = configuration; 

    return (
        <DesignConfigurator configId={configuration.id} imageDimensions={{width, height}} imageUrl={imageUrl}/>
    )
}

export default Page;