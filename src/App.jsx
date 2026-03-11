import { useState } from "react";
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import MeuPDF from "./DeclaracaoConteudo";

/* =================== UTIL =================== */

const apenasNumeros = (v) => v.replace(/\D/g, "");

const consultarCEP = async (cep) => {
  try {
    const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    return resposta.data;
  } catch (error) {
    console.error("Erro ao consultar CEP:", error);
    return null;
  }
};

const formatarCEP = (v) => {
  v = apenasNumeros(v).slice(0, 8);
  return v.replace(/(\d{5})(\d)/, "$1-$2");
};
const formatarCPF = (v) => {
  v = apenasNumeros(v).slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatarCNPJ = (v) => {
  v = apenasNumeros(v).slice(0, 14);
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatarDocumento = (v) => {
  const nums = apenasNumeros(v);
  if (nums.length <= 11) return formatarCPF(v);
  return formatarCNPJ(v);
};

/* =================== COMPONENTES =================== */

function Campo({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium">{label}</label>
      <input
        className="border rounded p-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    remetente: {
      nome: "",
      endereco: "",
      cidade: "",
      uf: "",
      documento: "",
      cep: "",
    },
    destinatario: {
      nome: "",
      endereco: "",
      cidade: "",
      uf: "",
      documento: "",
      cep: "",
    },
    data: new Date().toISOString().split("T")[0],
    itens: [{ descricao: "", quantidade: 0.0, valor: 0.0, peso: 0.0 }],
  });

  const gerarPDF = async () => {
    const blob = await pdf(<MeuPDF {...form} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "declaracao.pdf";
    link.click();
  };

  /* =================== HANDLERS =================== */

  const handlePessoaChange = (tipo, campo, valor) => {
    if (campo === "documento") {
      valor = formatarDocumento(valor);
    }

    if (campo === "uf") {
      valor = valor.toUpperCase().slice(0, 2);
    }

    if (campo === "cep") {
      valor = apenasNumeros(valor).slice(0, 8);
      if (valor.length === 8) {
        consultarCEP(valor).then((dados) => {
          if (dados) {
            setForm((prev) => ({
              ...prev,
              [tipo]: {
                ...prev[tipo],
                endereco: dados.logradouro,
                cidade: dados.localidade,
                uf: dados.uf,
              },
            }));
          }
        });
        valor = formatarCEP(valor);
      }
    }

    setForm((prev) => ({
      ...prev,
      [tipo]: { ...prev[tipo], [campo]: valor },
    }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const novosItens = [...prev.itens];

      if (field === "valor" || field === "quantidade" || field === "peso") {
        value = parseFloat(value) || 0;
      }

      novosItens[index] = { ...novosItens[index], [field]: value };
      return { ...prev, itens: novosItens };
    });
  };

  const adicionarItem = () => {
    setForm((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        { descricao: "", quantidade: 1, valor: 0, peso: 0 },
      ],
    }));
  };

  const removerItem = (index) => {
    setForm((prev) => {
      const novosItens = prev.itens.filter((_, i) => i !== index);
      // Garantir que pelo menos um item permaneça
      if (novosItens.length === 0) {
        return {
          ...prev,
          itens: [{ descricao: "", quantidade: 0, valor: 0, peso: 0 }],
        };
      }
      return { ...prev, itens: novosItens };
    });
  };

  /* =================== UI =================== */

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
          Gerador de Declaração de Conteúdo
        </h1>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-6">
          {/* Remetente */}
          <div>
            <h2 className="font-semibold mb-2">Remetente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Campo
                label="Nome"
                value={form.remetente.nome}
                onChange={(v) => handlePessoaChange("remetente", "nome", v)}
              />
              <Campo
                label={
                  form.remetente.documento
                    ? form.remetente.documento.length <= 14
                      ? "CPF"
                      : "CNPJ"
                    : "CPF/CNPJ"
                }
                value={form.remetente.documento}
                onChange={(v) =>
                  handlePessoaChange("remetente", "documento", v)
                }
              />
              <Campo
                label="CEP"
                value={form.remetente.cep || ""}
                onChange={(v) => handlePessoaChange("remetente", "cep", v)}
              />
              <Campo
                label="Endereço"
                value={form.remetente.endereco}
                onChange={(v) => handlePessoaChange("remetente", "endereco", v)}
              />
              <Campo
                label="Cidade"
                value={form.remetente.cidade}
                onChange={(v) => handlePessoaChange("remetente", "cidade", v)}
              />
              <Campo
                label="UF"
                value={form.remetente.uf}
                onChange={(v) => handlePessoaChange("remetente", "uf", v)}
              />
            </div>
          </div>

          {/* Destinatário */}
          <div>
            <h2 className="font-semibold mb-2">Destinatário</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Campo
                label="Nome"
                value={form.destinatario.nome}
                onChange={(v) => handlePessoaChange("destinatario", "nome", v)}
              />
              <Campo
                label={
                  form.destinatario.documento
                    ? form.destinatario.documento.length <= 14
                      ? "CPF"
                      : "CNPJ"
                    : "CPF/CNPJ"
                }
                value={form.destinatario.documento}
                onChange={(v) =>
                  handlePessoaChange("destinatario", "documento", v)
                }
              />
              <Campo
                label="CEP"
                value={form.destinatario.cep || ""}
                onChange={(v) => handlePessoaChange("destinatario", "cep", v)}
              />
              <Campo
                label="Endereço"
                value={form.destinatario.endereco}
                onChange={(v) =>
                  handlePessoaChange("destinatario", "endereco", v)
                }
              />
              <Campo
                label="Cidade"
                value={form.destinatario.cidade}
                onChange={(v) =>
                  handlePessoaChange("destinatario", "cidade", v)
                }
              />
              <Campo
                label="UF"
                value={form.destinatario.uf}
                onChange={(v) => handlePessoaChange("destinatario", "uf", v)}
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Data</label>
                <input
                  type="date"
                  className="border rounded p-2 text-sm"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Itens em tabela responsiva */}
          <div className="border p-4 rounded">
            <h2 className="font-semibold mb-3 text-center">Itens</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-sm">
                    <th className="p-2 text-left">Nome do Item</th>
                    <th className="p-2 text-left">Quantidade</th>
                    <th className="p-2 text-left">Peso (kg)</th>
                    <th className="p-2 text-left">Valor (R$)</th>
                    <th className="p-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {form.itens.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-1">
                        <input
                          placeholder="Descrição"
                          className="border rounded p-2 text-sm w-full"
                          value={item.descricao}
                          onChange={(e) =>
                            handleItemChange(index, "descricao", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          placeholder="Qtd"
                          className="border rounded p-2 text-sm w-full"
                          value={item.quantidade}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantidade",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Peso"
                          className="border rounded p-2 text-sm w-full"
                          value={item.peso}
                          onChange={(e) =>
                            handleItemChange(index, "peso", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Valor"
                          className="border rounded p-2 text-sm w-full"
                          value={item.valor}
                          onChange={(e) =>
                            handleItemChange(index, "valor", e.target.value)
                          }
                        />
                      </td>
                      <td className="p-1 text-center">
                        <button
                          onClick={() => removerItem(index)}
                          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          title="Remover item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={adicionarItem}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Adicionar Item
              </button>
            </div>
          </div>

          {/* Botão Gerar PDF */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={gerarPDF}
              className="bg-gray-700 text-white px-4 py-2 rounded w-full hover:bg-gray-800"
            >
              Imprimir / Gerar PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
