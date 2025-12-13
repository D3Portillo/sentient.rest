"use server"

export async function getDevPk() {
  return process?.env?.DEV_PK_SEED || ""
}
