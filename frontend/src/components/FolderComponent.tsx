interface FolderProps {
    folder: {
        id: string;
        title: string;
    };
    onClick: (id: string) => void;
}

export function FolderComponent({ folder, onClick }: FolderProps) {
    return (
        <div
            onClick={() => onClick(folder.id)}
            className="p-4 bg-white border rounded-lg shadow-sm cursor-pointer  flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
            </svg>
            <span className="font-medium truncate">{folder.title}</span>
        </div>
    );
}
