import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  endpoint: "imageUploader";
  value: string[];
  onChange: (url?: string) => void;
  onRemove: (url: string) => void;
}

export const FileUpload = ({
  endpoint,
  value,
  onChange,
  onRemove,
}: FileUploadProps) => {
  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="bg-rose-500 text-white p-1 rounded-full shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>
      <UploadDropzone
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          res.forEach((file) => onChange(file.url));
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
        appearance={{
          button: "bg-primary text-primary-foreground hover:bg-primary/90",
          container:
            "w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors bg-gray-50",
          label: "text-gray-600 hover:text-gray-900",
        }}
      />
    </div>
  );
};
