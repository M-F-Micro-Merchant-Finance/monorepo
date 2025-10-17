import React from 'react';

const LogoDisplay = () => {
    return (
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-10">
            <div className="relative">
                {/* 3D Background Ring */}
                <div className="absolute inset-0 w-48 h-48 rounded-full gradient-logo animate-rotate-3d opacity-20"></div>
                
                {/* Logo Container */}
                <div className="relative w-48 h-48 rounded-full shadow-logo animate-float-3d">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full shadow-glow opacity-50"></div>
                    
                    {/* Logo Image */}
                    <div className="relative w-full h-full rounded-full overflow-hidden glass-effect">
                        <img 
                            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTAiIGZpbGw9IiMwMDAwMDAiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjwhLS0gRGVjb3JhdGl2ZSBFbGVtZW50cyAtLT4KPGNPCLE+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSI1IDUiLz4KPGV0cnUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzIyYzU1ZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtZGFzaGFycmF5PSIzIDMiLz4KCjwhLS0gSGVhZCBDb250YWluZXIgLS0+CjxjaXJjbGUgY3g9IjEwMCIgY3k9Ijg1IiByPSIzNSIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KCjwhLS0gRmFjZSBGZWF0dXJlcyAtLT4KPCEtLSBFeWVzIC0tPgo8ZWxsaXBzZSBjeD0iOTAiIGN5PSI3OCIgcng9IjMiIHJ5PSI1IiBmaWxsPSIjMDAwIi8+CjxlbGxpcHNlIGN4PSIxMTAiIGN5PSI3OCIgcng9IjMiIHJ5PSI1IiBmaWxsPSIjMDAwIi8+CjwhLS0gTm9zZSAtLT4KPHBhdGggZD0iTTEwMCA4NUwxMDMgOTBMMTAwIDkyTDk3IDkwWiIgZmlsbD0iIzAwMCIvPgo8IS0tIE1vdXRoIC0tPgo8cGF0aCBkPSJNOTUgOTZRMTAwIDEwMiAxMDUgOTYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0dCBkPSJNODUgNzBDODUgNjUgMTAwIDYwIDEwMCA2MFMxMTUgNjUgMTE1IDcwUTExNSA3NSAxMDAgNzVRODUgNzUgODUgNzBaIiBmaWxsPSIjZmZmZmZmIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSIvPgoKPCEtLSBEZWNvcmF0aXZlIExlYXZlcyAtLT4KPGV0wCAieT0iIzk4ZmI5OCIgb3BhY2l0eT0iMC42Ij4KPGVsbGlwc2UgdHJhbnNmb3JtPSJyb3RhdGUoMzAgMTUwIDEyMCkiIGN4PSIxNTAiIGN5PSIxMjAiIHJ4PSI4IiByeT0iMTUiLz4KPGVsbGlwc2UgdHJhbnNmb3JtPSJyb3RhdGUoLTMwIDUwIDEyMCkiIGN4PSI1MCIgY3k9IjEyMCIgcng9IjgiIHJ5PSIxNSIvPgo8ZWxsaXBzZSB0cmFuc2Zvcm09InJvdGF0ZSg2MCAzMCA4MCkiIGN4PSIzMCIgY3k9IjgwIiByeD0iNiIgcnk9IjEyIi8+CjxlbGxpcHNlIHRyYW5zZm9ybT0icm90YXRlKC02MCAx"
                            alt="Business Logo"
                            className="w-full h-full object-cover animate-logo-pulse"
                            style={{
                                filter: 'drop-shadow(0 0 20px hsl(142 76% 36% / 0.6))'
                            }}
                        />
                    </div>
                </div>
                
                {/* Orbiting Elements */}
                <div className="absolute inset-0 animate-rotate-3d">
                    <div className="absolute w-3 h-3 bg-merchant-accent rounded-full shadow-glow"
                         style={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }}></div>
                    <div className="absolute w-2 h-2 bg-merchant-success rounded-full shadow-glow"
                         style={{ top: '50%', right: '10%', transform: 'translateY(-50%)' }}></div>
                    <div className="absolute w-2.5 h-2.5 bg-merchant-accent rounded-full shadow-glow"
                         style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}></div>
                    <div className="absolute w-2 h-2 bg-merchant-success rounded-full shadow-glow"
                         style={{ top: '50%', left: '10%', transform: 'translateY(-50%)' }}></div>
                </div>
            </div>
        </div>
    );
};

export default LogoDisplay;
