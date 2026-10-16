import Image from "next/image";
import quocHuyImg from "../../../public/quoc-huy.png";

export function LoadingScreen({
  message = "Đang tải...",
}: {
  message?: string;
}) {
  return (
    <main
      className="flex h-screen items-center justify-center p-8 text-sm text-ink-2"
      role="status"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Image
          src={quocHuyImg}
          alt="Quốc huy Việt Nam"
          className="h-48 w-auto shrink-0 object-contain drop-shadow-sm animate-pulse"
          priority
        />
        <p className="font-medium text-lg animate-pulse">{message}</p>
      </div>
    </main>
  );
}
