import { useState } from "react";

// hooks
import useLocalStorage from "hooks/useLocalStorage";

export const ImageUpload = () => {
    const [uploadedImages, setImages] = useLocalStorage("images", []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const allFiles: any = [];
        for (const file of e.target.files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const fileInfo = {
                    name: file.name,
                    type: file.type,
                    size: Math.round(file.size / 1000) + ' kB',
                    base64: reader.result,
                }

                allFiles.push(fileInfo);

                // All files loaded
                if (allFiles.length === e.target.files?.length) {
                    setImages(allFiles);
                }
            }
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="imageUpload">
            <h2>Add Image:</h2>
            <input type="file" multiple onChange={handleChange} />
            {uploadedImages?.map((fileInfo: any) => {
                return <img key={fileInfo.name} src={fileInfo.base64} style={{maxWidth: 100}}/>
            })}
        </div>
    );
};
