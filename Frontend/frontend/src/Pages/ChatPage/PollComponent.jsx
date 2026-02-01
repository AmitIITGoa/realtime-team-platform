import { useState, useEffect } from "react";

const PollComponent = ({ message, pollOptions, voteAPI, currentUser, socket}) => {
    // Track the user's selected option
    const [selectedOption, setSelectedOption] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const userHasVoted = pollOptions.some(option => 
            option.userVoted.some(user => user.userId === currentUser.userId)
        );
        setHasVoted(userHasVoted);
        setSelectedOption(userHasVoted ? pollOptions.find(option => 
            option.userVoted.some(user => user.userId === currentUser.userId)
        )?.optId : null);
    }, [pollOptions, message]);

    // console.log("has voted : " + hasVoted + " " + message.text);
    return (
    <div>
            {message.isPoll ? (
        <div>
            <p className="font-medium mb-2">{message.text}</p>
                    {pollOptions.map((option) => {
                        const userVotedForThis = option.userVoted.some(user => user.userId === currentUser.userId);

                        return (
                <div key={option.optId} className="flex items-center gap-2 py-1">
                                <input
                                    type="radio"
                                    id={`option-${option.optId}`}
                                    name={`poll-${message.messageId}`}
                                    checked={selectedOption ? selectedOption === option.optId : userVotedForThis}
                                    // disabled={hasVoted} // Allow changing vote
                                    onChange={() => {
                                        voteAPI(option.optId, socket);
                                        setHasVoted(true);
                                    }}
                    className="accent-black dark:accent-white"
                                />
                <label htmlFor={`option-${option.optId}`} className="ml-2">
                                    {option.optText}
                                </label>
                <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    ({option.userVoted.length} votes)
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p>{message.text}</p>
            )}
        </div>
    );
};

export default PollComponent;
