export interface ToastMsg {
  id: number;
  kind: "info" | "success" | "error";
  text: string;
}
