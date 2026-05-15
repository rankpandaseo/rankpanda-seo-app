import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Page, Layout, Card, FormLayout, TextField, Button, Banner } from '@shopify/polaris';
import ProtectedLayout from '../../components/ProtectedLayout';

const SETUP_STEPS = [
  'Contexto do Negócio',
  'Keywords do Negócio',
  'Categorias GMC',
  'Tom de Voz',
  'Google Analytics 4',
  'Google Search Console',
  'Bing Webmaster',
  'SE Ranking',
  'Shopify',
];

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const step = SETUP_STEPS[currentStep];

  const handleNext = async () => {
    setError('');

    if (currentStep === SETUP_STEPS.length - 1) {
      // Salvar projecto
      setLoading(true);
      try {
        // API call para salvar projecto com todos os dados
        const response = await fetch('/api/projetos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopName: projectName,
            businessContext: data['businessContext'],
            businessKeywords: data['businessKeywords'],
            merchantCenterCategories: data['merchantCenterCategories'],
            voiceTone: data['voiceTone'],
            ga4PropertyId: data['ga4PropertyId'],
            gscPropertyUrl: data['gscPropertyUrl'],
            bingWebmasterToken: data['bingWebmasterToken'],
            seRankingApiKey: data['seRankingApiKey'],
            setupCompleted: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        router.push('/app');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar projecto');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleChange = (value: string) => {
    setData({ ...data, [step.toLowerCase().replace(/ /g, '')]: value });
  };

  const stepContent: Record<string, { label: string; placeholder: string; type?: string }> = {
    'Contexto do Negócio': {
      label: 'Descreva o seu negócio',
      placeholder: 'Ex: Loja de vibadores com foco em...',
    },
    'Keywords do Negócio': {
      label: 'Keywords principais do seu negócio',
      placeholder: 'Ex: vibrador, brinquedo adulto, ...',
    },
    'Categorias GMC': {
      label: 'Categoria do Google Merchant Center',
      placeholder: 'Ex: Health & Beauty > Personal Care',
    },
    'Tom de Voz': {
      label: 'Tom de voz para conteúdo',
      placeholder: 'Ex: Profissional, descontraído, educational',
    },
    'Google Analytics 4': {
      label: 'Property ID do Google Analytics 4',
      placeholder: 'Ex: G-XXXXXXXXXX',
    },
    'Google Search Console': {
      label: 'URL da propriedade GSC',
      placeholder: 'Ex: https://www.example.com',
    },
    'Bing Webmaster': {
      label: 'Token do Bing Webmaster Tools',
      placeholder: 'Deixe em branco se não usa',
    },
    'SE Ranking': {
      label: 'API Key do SE Ranking',
      placeholder: 'Chave da API',
    },
    'Shopify': {
      label: 'Nome da loja Shopify',
      placeholder: 'Ex: mystore.myshopify.com',
    },
  };

  const config = stepContent[step] || {};

  return (
    <ProtectedLayout title="Setup do Projecto">
      <Page title={`Setup - Passo ${currentStep + 1} de ${SETUP_STEPS.length}`}>
        <Layout>
          <Layout.Section>
            <Card>
              <FormLayout>
                {error && (
                  <Banner tone="critical" onDismiss={() => setError('')}>
                    {error}
                  </Banner>
                )}

                {currentStep === 0 && (
                  <TextField
                    label="Nome do Projecto"
                    value={projectName}
                    onChange={setProjectName}
                    placeholder="Ex: Vibradores PT"
                  />
                )}

                {currentStep > 0 && (
                  <TextField
                    label={config.label}
                    value={data[step.toLowerCase().replace(/ /g, '')] || ''}
                    onChange={handleChange}
                    placeholder={config.placeholder}
                    multiline
                  />
                )}

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <Button onClick={handleBack} disabled={currentStep === 0}>
                    Voltar
                  </Button>
                  <Button
                    primary
                    onClick={handleNext}
                    loading={loading}
                  >
                    {currentStep === SETUP_STEPS.length - 1 ? 'Concluir Setup' : 'Próximo'}
                  </Button>
                </div>
              </FormLayout>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </ProtectedLayout>
  );
}
