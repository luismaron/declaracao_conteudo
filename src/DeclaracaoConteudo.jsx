import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  title: {
    border: "2px solid black",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 5,
  },
  title2: {
    borderBottom: "1px solid black",
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: 2,
  },
  title3: {
    borderBottom: "2px solid black",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 10,
    paddingTop: 2,
  },
  row: {
    flexDirection: "row",
  },
  col: {
    width: "50%",
    border: "2px solid black",
  },
  cell: {
    borderBottom: "1px solid black",
  },
  tableHeader: {
    flexDirection: "row",
    fontWeight: "bold",
    borderBottom: "1px solid black",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
  },

  cellItem: {
    width: "10%",
    padding: 5,
    borderRight: "1px solid #ccc",

    textAlign: "center",
  },
  cellDesc: { borderRight: "1px solid #ccc", width: "50%", padding: 5 },
  cellQtd: {
    borderRight: "1px solid #ccc",
    width: "15%",
    padding: 5,
    textAlign: "right",
  },
  cellValor: {
    width: "25%",
    padding: 5,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    fontWeight: "bold",
  },
  assinatura: {
    textAlign: "center",
  },
  linhaAssinatura: {
    borderTop: "1px solid black",
    width: 300,
    marginTop: 20,
    marginBottom: 5,
    alignSelf: "center",
  },
  bold: {
    fontWeight: "bold",
  },
});

const formatarMoeda = (valor) => {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const MeuPDF = ({ remetente, destinatario, itens, data }) => {
  const totalzao = itens.reduce(
    (acc, item) => {
      return {
        total: acc.total + item.quantidade * item.valor,
        peso: acc.peso + (item.peso * item.quantidade || 0),
      };
    },
    { total: 0, peso: 0 },
  );

  const totalGeral = totalzao.total;

  const pesoTotal = totalzao.peso.toFixed(3);

  const dataObj = new Date(data + "T00:00:00");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>DECLARAÇÃO DE CONTEÚDO</Text>

        {/* Remetente e Destinatário lado a lado */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.title2}>REMETENTE</Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>NOME: </Text>
              {remetente.nome}
            </Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>ENDEREÇO: </Text> {remetente.endereco}
            </Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>CIDADE/UF: </Text> {remetente.cidade} -{" "}
              {remetente.uf}
            </Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>CEP: </Text> {remetente.cep}
            </Text>
            <Text>
              <Text style={styles.bold}>
                {remetente.documento.length <= 14 ? "CPF:" : "CNPJ:"}{" "}
              </Text>{" "}
              {remetente.documento}
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.title2}>DESTINATÁRIO</Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>NOME: </Text>
              {destinatario.nome}
            </Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>ENDEREÇO: </Text>{" "}
              {destinatario.endereco}
            </Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>CIDADE/UF: </Text> {destinatario.cidade}{" "}
              - {destinatario.uf}
            </Text>
            <Text style={styles.cell}>
              <Text style={styles.bold}>CEP: </Text> {destinatario.cep}
            </Text>
            <Text>
              <Text style={styles.bold}>
                {destinatario.documento.length <= 14 ? "CPF:" : "CNPJ:"}{" "}
              </Text>{" "}
              {destinatario.documento}
            </Text>
          </View>
        </View>

        {/* Tabela de Itens */}
        <View style={{ marginTop: 4, border: "2px solid black" }}>
          <Text style={styles.title3}>IDENTIFICAÇÃO DOS BENS</Text>

          {/* Cabeçalho */}
          <View style={styles.tableHeader}>
            <Text style={styles.cellItem}>ITEM</Text>
            <Text style={styles.cellDesc}>CONTEÚDO</Text>
            <Text style={styles.cellQtd}>QUANT.</Text>
            <Text style={styles.cellValor}>VALOR</Text>
          </View>

          {/* Linhas de itens */}
          {itens.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cellItem}>{index + 1}</Text>
              <Text style={styles.cellDesc}>{item.descricao}</Text>
              <Text style={styles.cellQtd}>{item.quantidade}</Text>
              <Text style={styles.cellValor}>{formatarMoeda(item.valor)}</Text>
            </View>
          ))}

          {/* Totais */}
          <View style={[styles.totalRow, { borderBottom: "1px solid #ccc" }]}>
            <Text style={[styles.cellItem, { backgroundColor: "#ccc" }]}></Text>
            <Text
              style={[
                styles.cellDesc,
                { textAlign: "right", backgroundColor: "#ccc" },
              ]}
            >
              TOTAIS:
            </Text>
            <Text style={styles.cellQtd}>
              {itens.reduce((acc, item) => acc + item.quantidade, 0)}
            </Text>
            <Text style={styles.cellValor}>{formatarMoeda(totalGeral)}</Text>
          </View>

          {/* Peso Total */}
          <View style={styles.totalRow}>
            <Text style={[styles.cellItem, { backgroundColor: "#ccc" }]}></Text>
            <Text
              style={[
                styles.cellDesc,
                { textAlign: "right", backgroundColor: "#ccc" },
              ]}
            >
              PESO TOTAL (kg):
            </Text>
            <Text
              style={[styles.cellQtd, { borderRightColor: "white" }]}
            ></Text>
            <Text style={styles.cellValor}>{pesoTotal}</Text>
          </View>
        </View>

        {/* Textos legais */}
        <View style={{ border: "2px solid black", marginTop: 5 }}>
          <Text style={styles.title3}>DECLARAÇÃO</Text>
          <Text style={{ fontSize: "8", textAlign: "justify", textIndent: 15 }}>
            Declaro que não me enquadro no conceito de contribuinte previsto no
            art. 4º da Lei Complementar nº 87/1996, uma vez que não realizo, com
            habitualidade ou em volume que caracterize intuito comercial,
            operações de circulação de mercadoria, ainda que se iniciem no
            exterior, ou estou dispensado da emissão da nota fiscal por força da
            legislação tributária vigente, responsabilizando-me, nos termos da
            lei e a quem de direito, por informações inverídicas.
          </Text>
          <Text
            style={{
              fontSize: 8,
              textAlign: "justify",
              textIndent: 15,
              marginBottom: 10,
            }}
          >
            Declaro que não envio objeto que ponha em risco o transporte aéreo,
            nem objeto proibido no fluxo postal, assumindo responsabilidade pela
            informação prestada, e ciente de que o descumprimento pode
            configurar crime, conforme artigo 261 do Código Penal Brasileiro.
            Declaro, ainda, estar ciente da lista de proibições e restrições,
            disponível no site dos Correios:
            https://www.correios.com.br/enviar/proibicoes-
            e-restricoes/proibicoes-e-restricoes.
          </Text>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "justify",
                alignSelf: "flex-start",
              }}
            >
              {remetente.cidade}
              {", "} {dataObj.getDate().toString().padStart(2, "0")} de{" "}
              {dataObj.toLocaleString("pt-BR", { month: "long" })} de{" "}
              {dataObj.getFullYear()}
            </Text>
            <View
              style={{
                textAlign: "center",
                alignSelf: "flex-end",
                alignItems: "center",
              }}
            >
              <Text>______________________________________</Text>
              <Text style={{ textAlign: "center" }}>
                Assinatura do Declarante/Remetente
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            border: "2px solid black",
            marginTop: 5,
            fontSize: 8,
            paddingLeft: 10,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>OBSERVAÇÕES</Text>
          <Text style={{ textAlign: "justify" }}>
            Constitui crime contra a ordem tributária suprimir ou reduzir
            tributo, ou contribuição social e qualquer acessório (Lei 8.137/90
            Art. 1º, V).
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MeuPDF;
