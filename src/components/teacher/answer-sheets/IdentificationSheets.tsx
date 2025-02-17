import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function IdentificationSheets() {
  const downloadPDF = (numQuestions : number) => {
    const filePath = `/pdf/Identification_${numQuestions}_Questions.pdf`;
    const link = document.createElement("a");
    link.href = filePath;
    link.download = `Identification_${numQuestions}_Questions.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Link href="/answer-sheets">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Identification</h1>
        </div>
        <p className="text-sm"> Print your answer sheets based on your number of questions. </p>
      </div>
      <div className="p-4 flex w-full gap-4 flex-wrap justify-center">
        {[5, 10, 15, 20].map((num) => (
          <div
            key={num}
            className="w-52 flex flex-col p-4 aspect-[8.5/11] bg-white border items-center border-black rounded-lg cursor-pointer"
            onClick={() => downloadPDF(num)}
          >
            <Image 
              src={`/images/Identification_${num}_Questions.png`} 
              alt={`${num} Questions`} 
              width={208} 
              height={272} 
              className="rounded-md mb-2"
            />
            <p className="mt-auto text-center w-full">{num} Questions</p>
          </div>
        ))}
      </div>
    </div>
  );
}
