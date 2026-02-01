import React, { useEffect } from "react";
import { createPortal } from 'react-dom';

const MemberSidebar = ({ members, onClose, handleMemberAction }) => {

    useEffect(() => {

    }, [members]);

    return createPortal(
        <div className="fixed inset-0 z-[70] flex">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="ml-auto h-full w-80 max-w-[85%] bg-white border-l border-neutral-200 overflow-y-auto dark:bg-neutral-800 dark:border-neutral-700 translate-x-0 animate-[slideIn_0.2s_ease-out]">
                <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700/50">
                    <span className="font-medium">Group Members</span>
                    <button className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white" onClick={onClose}>
                        ✖
                    </button>
                </div>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {members.map((member) => (
                        <div className="flex items-center justify-between px-3 py-2" key={member.person.userId}>
                            <span className="text-sm">{member.person.name}</span>
                            <div className="flex items-center gap-2">
                                {member.isAuthenticated && !member.isExited ? (
                                    <button
                                        className="px-2 py-1 text-xs rounded-md bg-red-600 hover:bg-red-700"
                                        onClick={() => handleMemberAction("remove", member.person.userId)}
                                    >
                                        Remove
                                    </button>
                                ) : !member.isExited ? (
                                    <>
                                        <button
                                            className="px-2 py-1 text-xs rounded-md bg-green-600 hover:bg-green-700"
                                            onClick={() => handleMemberAction("accept", member.person.userId)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="px-2 py-1 text-xs rounded-md bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-500"
                                            onClick={() => handleMemberAction("reject", member.person.userId)}
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MemberSidebar;
