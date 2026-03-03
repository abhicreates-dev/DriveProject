import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { FolderComponent } from "../components/FolderComponent";
import { FileComponent } from "../components/FileComponent";

interface Folder {
    id: string;
    title: string;
    parentId: string | null;
    userId: string;
}
interface Files {
    id: string;
    title: string;
    parentId: string | null;
    userId: string;
    filelink: string;
    type: "pdf" | "video"
}

export function Home() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [files, setFiles] = useState<Files[]>([])

    const [newFolderName, setNewFolderName] = useState("");
    const [newFile, setNewFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isfileloading, setIsFileloading] = useState(true)
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Parse parentId from query params, e.g., ?parentId=123
    const searchParams = new URLSearchParams(location.search);
    const parentId = searchParams.get("parentId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchFolders = async () => {

            if (!token) {
                navigate("/signin");
                return;
            }

            setIsLoading(true);
            setError(null);

            const url = parentId
                ? `http://localhost:3001/folders/${parentId}`
                : "http://localhost:3001/folders";

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFolders(response.data.data);
            setIsLoading(false);
        };

        fetchFolders();
    }, [parentId, navigate, refreshKey]);

    useEffect(() => {
        const fetchFiles = async () => {
            if (!parentId) {
                return setIsFileloading(false)
            }

            const response = await axios.get(`http://localhost:3001/files/${parentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setFiles(response.data.data)
            setIsFileloading(false)
        }

        fetchFiles()

    }, [parentId, navigate, refreshKey])

    const handleCreateFolder = async (e: any) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        await axios.post("http://localhost:3001/createFolder", {
            title: newFolderName,
            parentId: parentId || undefined
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setNewFolderName("");
        setRefreshKey(prev => prev + 1);
    };

    const handleUpload = async (e: any) => {
        e.preventDefault();

        if (!newFile) return;

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        const presignResponse = await axios.post("http://localhost:3001/presign", {
            fileName: newFile.name,
            fileType: newFile.type,
        });

        const signedUrl = presignResponse.data.signedUrl;
        const publicUrl = presignResponse.data.publicUrl;
        const key = presignResponse.data.key;

        await axios.put(signedUrl, newFile, {
            headers: {
                "Content-Type": newFile.type,
            },
        });

        await axios.post(
            "http://localhost:3001/createFile",
            {
                title: newFile.name,
                type: "pdf",
                filelink: publicUrl ?? key,
                parentId: parentId || null,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setNewFile(null);
        setRefreshKey((prev) => prev + 1);
    };



    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/signin");
    };

    const handleFolderClick = (folderId: string) => {
        navigate(`/?parentId=${folderId}`);
    };

    const navigateUp = () => {
        navigate("/");
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Drive</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>

            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md">{error}</div>}

            <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-sm border flex flex-col md:flex-row lg:flex-row gap-4">
                <form onSubmit={handleCreateFolder} className="flex gap-4">
                    <Input
                        placeholder="Add New folder" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">Create Folder</Button>
                </form>

                <form onSubmit={handleUpload} className="flex gap-4">
                    <Input type="file" onChange={(e) => setNewFile(e.target.files?.[0] ?? null)} />
                    <Button type="submit">Upload</Button>
                </form>
            </div>

            {parentId && (
                <Button variant="ghost" onClick={navigateUp} className="mb-4">
                    ← Back to Root
                </Button>
            )}

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : folders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    No folders found here.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {folders.map(folder => (
                        <FolderComponent key={folder.id} folder={folder} onClick={handleFolderClick} />
                    ))}
                </div>
            )}

            <div className="mt-20 text-xl mb-5">Files:</div>

            <div>
                {isfileloading ? (
                    <div>Loading...</div>
                ) : (files.length === 0) ? (
                    <div>No Files here</div>
                ) :
                    (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                            {files.map(file => (
                                <FileComponent key={file.id} file={file} />
                            ))}

                        </div>
                    )

                }
            </div>
        </div>
    );
}