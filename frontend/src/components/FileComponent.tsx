interface FileProps {
    file: {
        id: string;
        title: string;
    };
}

export function FileComponent({ file }: FileProps) {
    return (
        <div className="p-4 bg-white border rounded-lg shadow-sm cursor-pointer  flex items-center gap-3">
            <div>{file.title}</div>
        </div>
    );
}
