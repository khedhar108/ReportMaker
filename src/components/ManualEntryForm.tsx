import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, X, ChevronRight, ChevronDown, Wand2, Trash2, FileJson, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---

type EntryNodeType = 'category' | 'subject';

interface EntryNode {
    id: string;
    type: EntryNodeType;
    name: string;
    // For subject/leaf nodes
    marksObtained?: string;
    maxMarks?: string;
    // For category/parent nodes
    children?: EntryNode[];
    isOpen?: boolean; // UI state for collapsing
}

interface StudentInfo {
    name: string;
    rollNo: string;
    customFields: { id: string; key: string; value: string }[];
}

interface ManualEntryFormProps {
    onGenerate: (data: unknown) => void;
    onCancel: () => void;
}

// --- Utils ---

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

export function ManualEntryForm({ onGenerate, onCancel }: ManualEntryFormProps) {
    // State
    const [student, setStudent] = useState<StudentInfo>({
        name: '',
        rollNo: '',
        customFields: []
    });

    const [academicData, setAcademicData] = useState<EntryNode[]>([
        {
            id: generateId(),
            type: 'category',
            name: 'Scholastic Areas',
            isOpen: true,
            children: [
                { id: generateId(), type: 'subject', name: 'Mathematics', marksObtained: '', maxMarks: '100' },
                { id: generateId(), type: 'subject', name: 'Science', marksObtained: '', maxMarks: '100' }
            ]
        },
        {
            id: generateId(),
            type: 'category',
            name: 'Co-Scholastic',
            isOpen: true,
            children: [
                { id: generateId(), type: 'subject', name: 'Art Education', marksObtained: 'A', maxMarks: 'Grade' }
            ]
        }
    ]);

    const [previewMode, setPreviewMode] = useState(false);

    // --- Handlers: Student Info ---

    const addCustomField = () => {
        setStudent(prev => ({
            ...prev,
            customFields: [...prev.customFields, { id: generateId(), key: '', value: '' }]
        }));
    };

    const updateCustomField = (id: string, field: 'key' | 'value', text: string) => {
        setStudent(prev => ({
            ...prev,
            customFields: prev.customFields.map(f => f.id === id ? { ...f, [field]: text } : f)
        }));
    };

    const removeCustomField = (id: string) => {
        setStudent(prev => ({
            ...prev,
            customFields: prev.customFields.filter(f => f.id !== id)
        }));
    };

    // --- Handlers: Academic Data (Recursive) ---

    // Simple recursive update function
    const updateNode = (nodes: EntryNode[], targetId: string, updater: (node: EntryNode) => EntryNode): EntryNode[] => {
        return nodes.map(node => {
            if (node.id === targetId) return updater(node);
            if (node.children) return { ...node, children: updateNode(node.children, targetId, updater) };
            return node;
        });
    };

    const deleteNode = (nodes: EntryNode[], targetId: string): EntryNode[] => {
        return nodes
            .filter(node => node.id !== targetId)
            .map(node => ({
                ...node,
                children: node.children ? deleteNode(node.children, targetId) : undefined
            }));
    };

    const addNode = (nodes: EntryNode[], parentId: string | null, newNode: EntryNode): EntryNode[] => {
        if (parentId === null) return [...nodes, newNode]; // Add to root
        return nodes.map(node => {
            if (node.id === parentId) {
                return { ...node, children: [...(node.children || []), newNode], isOpen: true };
            }
            if (node.children) return { ...node, children: addNode(node.children, parentId, newNode) };
            return node;
        });
    };

    const handleUpdateNode = (id: string, field: keyof EntryNode, value: unknown) => {
        setAcademicData(prev => updateNode(prev, id, n => ({ ...n, [field]: value })));
    };

    const handleDeleteNode = (id: string) => {
        setAcademicData(prev => deleteNode(prev, id));
    };

    const handleAddChild = (parentId: string | null, type: EntryNodeType) => {
        const newNode: EntryNode = type === 'category'
            ? { id: generateId(), type: 'category', name: 'New Category', children: [], isOpen: true }
            : { id: generateId(), type: 'subject', name: 'New Subject', marksObtained: '', maxMarks: '100' };

        setAcademicData(prev => addNode(prev, parentId, newNode));
    };

    // --- Format Output ---

    const formatOutput = () => {
        // Convert to the Excel-like flat structure Groq expects OR a structured JSON
        // Based on current Groq prompt, it handles hierarchy via keys or nested structure.
        // Let's create a faithful JSON representation.

        const processNode = (node: EntryNode): unknown => {
            if (node.type === 'subject') {
                return {
                    name: node.name,
                    marks: node.marksObtained,
                    maxMarks: node.maxMarks
                };
            }
            // Category
            const childrenObj: Record<string, unknown> = {};
            node.children?.forEach(child => {
                childrenObj[child.name] = processNode(child);
            });
            return childrenObj;
        };

        const academicObj: Record<string, unknown> = {};
        academicData.forEach(node => {
            academicObj[node.name] = processNode(node);
        });

        const finalData = {
            studentProfile: {
                name: student.name,
                rollNo: student.rollNo,
                ...student.customFields.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
            },
            academicPerformance: academicObj
        };

        return finalData;
    };

    const handleSubmit = () => {
        const data = formatOutput();
        // Since the current app expects an array of rows (Excel logic), wrap it
        // Or better, update Groq handling to accept this direct object.
        // For now, let's wrap it in an array as if it's one "row" object, though it's deep.
        onGenerate([data]);
    };

    // --- Render Helpers ---

    const renderNode = (node: EntryNode, level: number = 0) => {
        const isCategory = node.type === 'category';

        return (
            <div key={node.id} className={cn("relative transition-all", level > 0 && "ml-4 md:ml-6")}>
                {level > 0 && (
                    <div className="absolute -left-4 md:-left-6 top-6 w-3 md:w-5 h-px bg-white/20" /> // Horizontal connector
                )}
                {level > 0 && (
                    <div className="absolute -left-4 md:-left-6 -top-1 bottom-0 w-px bg-white/20" /> // Vertical line
                )}

                <div className={cn(
                    "flex flex-col md:flex-row gap-3 mb-3 p-3 rounded-xl border group items-start md:items-center transition-all hover:bg-white/5",
                    isCategory ? "bg-white/5 border-white/10" : "bg-transparent border-white/5"
                )}>
                    {/* Expand/Collapse for Categories */}
                    {isCategory && (
                        <button
                            onClick={() => handleUpdateNode(node.id, 'isOpen', !node.isOpen)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors hidden md:block"
                        >
                            {node.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    )}

                    {/* Node Type Indicator */}
                    <div className="flex items-center gap-3 flex-1 w-full">
                        {isCategory ? (
                            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                        ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
                        )}
                        <Input
                            value={node.name}
                            onChange={(e) => handleUpdateNode(node.id, 'name', e.target.value)}
                            className="h-9 font-medium bg-transparent border-transparent hover:border-white/20 focus:border-purple-500 text-white placeholder:text-slate-600 flex-1 min-w-[120px] transition-all"
                            placeholder={isCategory ? "Category Name" : "Subject Name"}
                        />
                    </div>

                    {/* Inputs for Subjects */}
                    {!isCategory && (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="flex items-center bg-slate-900/50 rounded-lg border border-white/10 overflow-hidden">
                                <Input
                                    value={node.marksObtained}
                                    onChange={(e) => handleUpdateNode(node.id, 'marksObtained', e.target.value)}
                                    className="h-9 w-20 md:w-24 text-center border-none bg-transparent text-white focus-visible:ring-0 placeholder:text-slate-600"
                                    placeholder="Marks"
                                />
                                <span className="text-slate-600 text-sm px-1">/</span>
                                <Input
                                    value={node.maxMarks}
                                    onChange={(e) => handleUpdateNode(node.id, 'maxMarks', e.target.value)}
                                    className="h-9 w-20 md:w-24 text-center border-none bg-transparent text-slate-400 focus-visible:ring-0 placeholder:text-slate-600"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity self-end md:self-auto">
                        {isCategory && (
                            <>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => handleAddChild(node.id, 'subject')} title="Add Subject">
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => handleAddChild(node.id, 'category')} title="Add Sub-Category">
                                    <Layers className="w-4 h-4" />
                                </Button>
                                <Separator orientation="vertical" className="h-4 mx-1 bg-white/10" />
                            </>
                        )}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteNode(node.id)}
                            title="Remove"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Recursive Children */}
                {isCategory && node.isOpen && node.children && (
                    <div className="flex flex-col border-l border-white/5 ml-[19px] md:ml-[22px]">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-white">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Manual Entry</h2>
                    <p className="text-slate-400 mt-1">Design the student's report card structure structurally.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant={previewMode ? "secondary" : "ghost"} onClick={() => setPreviewMode(!previewMode)} className="text-slate-300 hover:text-white hover:bg-white/10 border border-white/10">
                        <FileJson className="w-4 h-4 mr-2" />
                        {previewMode ? "Hide JSON" : "Show JSON"}
                    </Button>
                    <Button variant="outline" onClick={onCancel} className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 border border-white/10">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Form Info */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                        <CardHeader className="border-b border-white/10 pb-4">
                            <CardTitle className="text-lg text-white">Student Profile</CardTitle>
                            <CardDescription className="text-slate-400">Basic details required for the report.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Student Name</Label>
                                <Input
                                    placeholder="e.g. John Doe"
                                    value={student.name}
                                    onChange={(e) => setStudent({ ...student, name: e.target.value })}
                                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Roll Number / ID</Label>
                                <Input
                                    placeholder="e.g. 1045"
                                    value={student.rollNo}
                                    onChange={(e) => setStudent({ ...student, rollNo: e.target.value })}
                                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Class / Grade</Label>
                                <Input
                                    placeholder="e.g. 10th"
                                    value={student.customFields.find(f => f.key === 'Class')?.value || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setStudent(prev => {
                                            const existing = prev.customFields.find(f => f.key === 'Class');
                                            if (existing) {
                                                return {
                                                    ...prev,
                                                    customFields: prev.customFields.map(f => f.key === 'Class' ? { ...f, value: val } : f)
                                                };
                                            }
                                            return {
                                                ...prev,
                                                customFields: [...prev.customFields, { id: generateId(), key: 'Class', value: val }]
                                            };
                                        });
                                    }}
                                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500 focus:ring-purple-500/20"
                                />
                            </div>

                            <Separator className="bg-white/10" />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-400">Custom Attributes</Label>
                                    <Button size="sm" variant="ghost" onClick={addCustomField} className="h-6 px-2 text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                                        <Plus className="w-3 h-3 mr-1" /> Add Field
                                    </Button>
                                </div>
                                <AnimatePresence>
                                    {student.customFields.map(field => (
                                        <motion.div
                                            key={field.id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex gap-2 items-center"
                                        >
                                            <Input
                                                className="h-8 text-xs bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                                                placeholder="Key"
                                                value={field.key}
                                                onChange={(e) => updateCustomField(field.id, 'key', e.target.value)}
                                            />
                                            <Input
                                                className="h-8 text-xs bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"
                                                placeholder="Value"
                                                value={field.value}
                                                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                            />
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => removeCustomField(field.id)}>
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>

                    {previewMode && (
                        <Card className="bg-black/40 border-white/10 text-slate-300 overflow-hidden backdrop-blur-md">
                            <CardHeader className="pb-2 border-b border-white/5">
                                <CardTitle className="text-sm font-mono text-purple-400">Live Data Payload</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <pre className="text-xs font-mono overflow-auto max-h-[300px] text-green-400/80">
                                    {JSON.stringify(formatOutput(), null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Academic Structure */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                        {/* Exam Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-4">
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Talent Hunt Examination 2026</h2>
                            </div>
                        </div>

                        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl min-h-[600px] flex flex-col">
                            <CardHeader className="border-b border-white/10 pb-4 sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-xl rounded-t-xl">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-lg text-white">Academic Structure</CardTitle>
                                        <CardDescription className="text-slate-400">Build the hierarchy of subjects and marks.</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => handleAddChild(null, 'category')} className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10">
                                        <Plus className="w-4 h-4" /> Root Category
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-1 relative">
                                <div className="space-y-1">
                                    {academicData.map(node => renderNode(node))}
                                </div>

                                {academicData.length === 0 && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                            <Layers className="w-8 h-8 opacity-40" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-400">Structure is empty</p>
                                        <p className="text-sm opacity-60 mb-6">Start by adding a main category (e.g., "Scholastic")</p>
                                        <Button onClick={() => handleAddChild(null, 'category')} className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 border border-purple-500/30">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Scholastic Area
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
