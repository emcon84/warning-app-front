import { Metadata } from "next";
import EditarEmpleadoClient from "./EditarEmpleadoClient";

export const metadata: Metadata = {
  title: "Editar perfil - Reportes Reconquista",
};

export default function EditarEmpleadoPage() {
  return <EditarEmpleadoClient />;
}
