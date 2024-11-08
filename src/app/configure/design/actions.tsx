 "use server"

import { db } from "@/db"
import { CaseColor, CaseFinish, CaseMaterial, PhoneModel } from "@prisma/client"

//server side logic function
//to exceute and saving the action of file in this server

export type SaveConfigArgs = {
    color: CaseColor
    finish: CaseFinish
    material: CaseMaterial
    model: PhoneModel
    configId: string
  }
  
  export async function saveConfig({
    color,
    finish,
    material,
    model,
    configId,
  }: SaveConfigArgs) {
    await db.configuration.update({
      where: { id: configId },
      data: { color, finish, material, model },
    })
}