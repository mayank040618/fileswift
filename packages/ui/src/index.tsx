import * as React from "react";

export const Button = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            style={{ padding: '8px 16px', borderRadius: '4px', background: 'blue', color: 'white', border: 'none' }}
        >
            {children}
        </button>
    );
};
