import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

interface GameCardProps {
  title: string;
  image: string;
  url: string;
}

export default function GameCard({ title, image, url }: GameCardProps) {
  return (
    <Link href={url} className="group">
      <Card className="w-full bg-teal-100 dark:bg-[#2c3e50] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow p-2">
        <div className="relative w-full aspect-square">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-t-2xl"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority
          />
        </div>
        <div className="py-4 px-2">
          <h2 className="text-center text-gray-800 dark:text-white font-luckiest text-lg sm:text-xl md:text-2xl tracking-wide">
            {title.toUpperCase()}
          </h2>
        </div>
      </Card>
    </Link>
  );
}
