import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedLayout from '@/components/ProtectedLayout';

const SETUP_STEPS = [
  'Contexto do Negócio',
  'Keywords do Negócio',
  'Categorias GMC',
  'Tom de Voz',
  'Google Analytics 4',
  'Google Search Console',
  'Bing Webmaster',
  'SE Ranking',
  'Shopify OAuth'
];

export default function Setup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projetos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: data.shopName || 'Projeto 1',
          businessContext: data.businessContext,
          businessKeywords: data.businessKeywords,
          merchantCenterCategories: data.merchantCenterCategories,
          voiceTone: data.voiceTone,
          ga4PropertyId: data.ga4PropertyId,
          gscPropertyUrl: data.gscPropertyUrl,
          bingWebmasterToken: data.bingWebmasterToken,
          seRankingApiKey: data.seRankingApiKey,
          setupCompleted: true,
        }),
      });

      if (response.ok) {
        router.push('/app');
      } else {
        alert('Erro ao criar projeto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout title="Configuração do Projeto">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Setup Wizard</h2>
            <span className="text-sm text-gray-600">
              Passo {currentStep + 1} de {SETUP_STEPS.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / SETUP_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {SETUP_STEPS[currentStep]}
          </h3>

          {currentStep === 0 && (
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Descreve o contexto do teu negócio..."
              value={data.businessContext || ''}
              onChange={(e) => handleInputChange('businessContext', e.target.value)}
              rows={4}
            />
          )}
          {currentStep === 1 && (
            <textarea
              className="w-full border rounded px-3 py-2"
              placeholder="Palavras-chave principais do teu negócio..."
              value={data.businessKeywords || ''}
              onChange={(e) => handleInputChange('businessKeywords', e.target.value)}
              rows={4}
            />
          )}
          {currentStep === 2 && (
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Ex: Electronics > Computers"
              value={data.merchantCenterCategories || ''}
              onChange={(e) => handleInputChange('merchantCenterCategories', e.target.value)}
            />
          )}
          {currentStep === 3 && (
            <select
              className="w-full border rounded px-3 py-2"
              value={data.voiceTone || ''}
              onChange={(e) => handleInputChange('voiceTone', e.target.value)}
            >
              <option value="">Seleciona tom de voz...</option>
              <option value="professional">Profissional</option>
              <option value="casual">Casual</option>
              <option value="playful">Brincalhão</option>
              <option value="formal">Formal</option>
            </select>
          )}
          {currentStep === 4 && (
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="GA4 Property ID"
              value={data.ga4PropertyId || ''}
              onChange={(e) => handleInputChange('ga4PropertyId', e.target.value)}
            />
          )}
          {currentStep === 5 && (
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="GSC Property URL"
              value={data.gscPropertyUrl || ''}
              onChange={(e) => handleInputChange('gscPropertyUrl', e.target.value)}
            />
          )}
          {currentStep === 6 && (
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Bing Webmaster Token"
              value={data.bingWebmasterToken || ''}
              onChange={(e) => handleInputChange('bingWebmasterToken', e.target.value)}
            />
          )}
          {currentStep === 7 && (
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="SE Ranking API Key"
              value={data.seRankingApiKey || ''}
              onChange={(e) => handleInputChange('seRankingApiKey', e.target.value)}
            />
          )}
          {currentStep === 8 && (
            <div className="text-gray-600">
              <p className="mb-4">Clica no botão abaixo para autorizar o acesso à tua loja Shopify.</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Autorizar Shopify
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Voltar
          </button>
          {currentStep < SETUP_STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Terminar'}
            </button>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
