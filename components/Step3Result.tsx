import React, { useState } from 'react';
import { generateTryOnImage } from '../services/geminiService';

interface Step3ResultProps {
  personImage: string;
  clothesImage: string;
  onResultGenerated: (resultUrl: string) => void;
  onBack: () => void;
}

const Step3Result: React.FC<Step3ResultProps> = ({ personImage, clothesImage, onResultGenerated, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const resultBase64 = await generateTryOnImage(personImage, clothesImage);
      onResultGenerated(resultBase64);
    } catch (err: any) {
      setError("生成失败，请稍后重试。可能由于图片内容过于复杂或服务器繁忙。");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-sm">3</span>
        准备就绪！
      </h2>

      <div className="flex items-center justify-center space-x-8 mb-8">
        <div className="relative">
             <img src={personImage} alt="Person" className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200" />
             <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">👤</div>
        </div>
        <div className="text-gray-300 text-2xl">+</div>
        <div className="relative">
             <img src={clothesImage} alt="Clothes" className="w-20 h-20 rounded-xl object-contain bg-gray-50 border-2 border-gray-200" />
             <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow">👕</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm max-w-md">
            {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isProcessing}
        className={`w-full max-w-sm py-4 rounded-xl font-bold text-xl text-white shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-3
            ${isProcessing ? 'bg-gray-800 cursor-not-allowed' : 'bg-black hover:bg-gray-900'}`}
      >
        {isProcessing ? (
           <>
             <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span>正在合成试穿效果...</span>
           </>
        ) : (
           <>
            <span>✨ 立即试穿</span>
           </>
        )}
      </button>

      <button onClick={onBack} className="mt-4 text-gray-500 hover:text-gray-800 underline text-sm">
        返回重选
      </button>

    </div>
  );
};

export default Step3Result;