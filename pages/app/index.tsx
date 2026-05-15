import React, { useEffect, useState } from 'react';
import { Page, Layout, Card, Button, Banner } from '@shopify/polaris';
import ProtectedLayout from '../../components/ProtectedLayout';

export default function DashboardPage() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const response = await fetch('/api/projetos/list');
        if (response.ok) {
          const data = await response.json();
          setProjetos(data);
        }
      } catch (error) {
        console.error('Error fetching projetos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjetos();
  }, []);

  return (
    <ProtectedLayout title="Dashboard">
      <Page title="Meus Projectos">
        <Layout>
          <Layout.Section>
            {projetos.length === 0 ? (
              <Card>
                <Banner>
                  Ainda não tem projectos. Comece criando um novo.
                </Banner>
              </Card>
            ) : (
              projetos.map((projeto) => (
                <Card key={projeto.id} sectioned>
                  <div>
                    <h3>{projeto.shopName}</h3>
                    <p>{projeto.businessContext}</p>
                    <Button primary onClick={() => window.location.href = `/app/projeto/${projeto.id}`}>
                      Abrir Projecto
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </Layout.Section>
        </Layout>
      </Page>
    </ProtectedLayout>
  );
}
