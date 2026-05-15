import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedLayout from '@/components/ProtectedLayout';

interface Projeto {
  id: string;
  shopName: string;
  businessContext?: string;
  setupCompleted: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjetos = async () => {
      try {
        const response = await fetch('/api/projetos/list');
        if (response.ok) {
          setProjetos(await response.json());
        }
      } catch (err) {
        console.error('Erro ao carregar projetos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjetos();
  }, []);

  const handleNewProject = () => {
    router.push('/app/setup');
  };

  return (
    <ProtectedLayout title="Meus Projetos">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projetos</h2>
          <button
            onClick={handleNewProject}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Novo Projeto
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando...</p>
          </div>
        ) : projetos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-600 mb-4">Ainda não tens projetos</p>
            <button
              onClick={handleNewProject}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/app/projeto/${projeto.id}`)}
              >
                <h3 className="text-lg font-semibold mb-2">{projeto.shopName}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {projeto.businessContext || 'Sem contexto'}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    projeto.setupCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {projeto.setupCompleted ? 'Configurado' : 'Configuração pendente'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/app/projeto/${projeto.id}`);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
