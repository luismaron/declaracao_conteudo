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
        valor = formatarCEP(valor); // corrigido: atribuição correta
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

      if (field === "valor") {
        value = parseFloat(value) || 0;
      }

      if (field === "quantidade") {
        value = parseFloat(value) || 0;
      }

      if (field === "peso") {
        value = parseFloat(value) || 0;
      }

      novosItens[index] = { ...novosItens[index], [field]: value };
      return { ...prev, itens: novosItens };
    });
  };

  const adicionarItem = () => {
    setForm((prev) => ({
      ...prev,
      itens: [...prev.itens, { descricao: "", quantidade: 1, valor: 0 }],
    }));
  };

  /* =================== UI =================== */

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold text-center mb-6">
          Gerador de Declaração de Conteúdo
        </h1>

        <div className="bg-white p-4 md:p-6 rounded-xl shadow space-y-6">
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
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Data</label>
                <input
                  label="Data"
                  type="date"
                  className="border rounded p-2 text-sm"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border p-1">
            <h2 className="font-semibold mb-2 text-center">Itens</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-1">
              <span className="text-sm font-medium md:col-span-3">
                Nome Item
              </span>
              <span className="text-sm font-medium">Quantidade</span>
              <span className="text-sm font-medium">Peso (kg)</span>
              <span className="text-sm font-medium">Valor</span>
            </div>
            {form.itens.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3"
              >
                <input
                  placeholder="Descrição"
                  className="border rounded p-2 text-sm md:col-span-3"
                  value={item.descricao}
                  onChange={(e) =>
                    handleItemChange(index, "descricao", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Qtd"
                  className="border rounded p-2 text-sm"
                  value={item.quantidade}
                  onChange={(e) =>
                    handleItemChange(index, "quantidade", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Peso"
                  className="border rounded p-2 text-sm"
                  value={item.peso}
                  onChange={(e) =>
                    handleItemChange(index, "peso", e.target.value)
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor"
                  className="border rounded p-2 text-sm"
                  value={item.valor}
                  onChange={(e) =>
                    handleItemChange(index, "valor", e.target.value)
                  }
                />
              </div>
            ))}

            <button
              onClick={adicionarItem}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Adicionar Item
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={gerarPDF}
              className="bg-gray-700 text-white px-4 py-2 rounded w-full"
            >
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
