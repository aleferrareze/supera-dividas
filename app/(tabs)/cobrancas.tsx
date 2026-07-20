import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type FormaPagamento = 'Boleto Bancário / Pix' | 'Pix' | 'Cartão de Crédito' | '';

interface Parcela {
  numero: number;
  valor: number;
  vencimento: string;
}

interface Cobranca {
  id: string;
  cliente: string;
  valorTotal: number;
  parcelas: Parcela[];
  formaPagamento: FormaPagamento;
  status: 'Pendente' | 'Pago' | 'Vencido';
  criadoEm: string;
}

const FORMAS_PAGAMENTO: FormaPagamento[] = [
  'Boleto Bancário / Pix',
  'Pix',
  'Cartão de Crédito',
];

const MAX_PARCELAS = 12;

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseCurrency(text: string): number {
  const cleaned = text.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function addMonths(dateStr: string, months: number): string {
  if (!dateStr || dateStr.length !== 10) return '';
  const [d, m, y] = dateStr.split('/').map(Number);
  const date = new Date(y, m - 1 + months, d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function buildParcelas(valorTotal: number, qtd: number, vencimento: string): Parcela[] {
  if (valorTotal <= 0 || qtd <= 0) return [];
  const base = Math.floor((valorTotal / qtd) * 100) / 100;
  const resto = Math.round((valorTotal - base * qtd) * 100) / 100;
  return Array.from({ length: qtd }, (_, i) => ({
    numero: i + 1,
    valor: i === qtd - 1 ? base + resto : base,
    vencimento: addMonths(vencimento, i),
  }));
}

export default function CobrancasScreen() {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // form state
  const [cliente, setCliente] = useState('');
  const [valorRaw, setValorRaw] = useState('');
  const [qtdParcelas, setQtdParcelas] = useState(1);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('');
  const [vencimento, setVencimento] = useState('');
  const [juros, setJuros] = useState('');
  const [multa, setMulta] = useState('');

  const [showFormaDropdown, setShowFormaDropdown] = useState(false);
  const [showParcelasDropdown, setShowParcelasDropdown] = useState(false);

  const valorTotal = parseCurrency(valorRaw);
  const parcelas = buildParcelas(valorTotal, qtdParcelas, vencimento);

  const handleValorChange = useCallback((text: string) => {
    setValorRaw(formatInput(text));
    setQtdParcelas(1);
  }, []);

  const handleVencimentoChange = useCallback((text: string) => {
    const digits = text.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length >= 3) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length >= 5) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    setVencimento(formatted);
  }, []);

  const resetForm = () => {
    setCliente('');
    setValorRaw('');
    setQtdParcelas(1);
    setFormaPagamento('');
    setVencimento('');
    setJuros('');
    setMulta('');
    setShowFormaDropdown(false);
    setShowParcelasDropdown(false);
  };

  const handleSalvar = () => {
    if (!cliente.trim()) return Alert.alert('Atenção', 'Informe o nome do cliente.');
    if (valorTotal <= 0) return Alert.alert('Atenção', 'Informe o valor da cobrança.');
    if (!formaPagamento) return Alert.alert('Atenção', 'Selecione a forma de pagamento.');
    if (!vencimento || vencimento.length < 10) return Alert.alert('Atenção', 'Informe o vencimento da 1ª parcela.');

    const nova: Cobranca = {
      id: String(Date.now()),
      cliente: cliente.trim(),
      valorTotal,
      parcelas,
      formaPagamento,
      status: 'Pendente',
      criadoEm: new Date().toLocaleDateString('pt-BR'),
    };

    setCobrancas(prev => [nova, ...prev]);
    resetForm();
    setModalVisible(false);
  };

  const parcelasOptions = Array.from({ length: MAX_PARCELAS }, (_, i) => {
    const n = i + 1;
    const valParcela = valorTotal > 0 ? valorTotal / n : 0;
    return {
      qtd: n,
      label: n === 1
        ? `À vista${valorTotal > 0 ? ` (R$ ${formatCurrency(valorTotal)})` : ''}`
        : `${n}x de R$ ${formatCurrency(valParcela)}`,
    };
  });

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Cobranças</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={s.addBtnText}>+ Adicionar cobrança</Text>
        </TouchableOpacity>
      </View>

      {cobrancas.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>💳</Text>
          <Text style={s.emptyText}>Nenhuma cobrança registrada</Text>
          <Text style={s.emptySubtext}>Toque em "Adicionar cobrança" para começar</Text>
        </View>
      ) : (
        <FlatList
          data={cobrancas}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardRow}>
                <Text style={s.cardCliente}>{item.cliente}</Text>
                <View style={[s.badge, item.status === 'Pago' ? s.badgePago : s.badgePendente]}>
                  <Text style={s.badgeText}>{item.status}</Text>
                </View>
              </View>
              <Text style={s.cardValor}>R$ {formatCurrency(item.valorTotal)}</Text>
              <Text style={s.cardMeta}>{item.formaPagamento} · {item.parcelas.length}x</Text>
              <View style={s.parcelasList}>
                {item.parcelas.map(p => (
                  <View key={p.numero} style={s.parcelaRow}>
                    <Text style={s.parcelaNum}>{p.numero}ª</Text>
                    <Text style={s.parcelaValor}>R$ {formatCurrency(p.valor)}</Text>
                    <Text style={s.parcelaVenc}>{p.vencimento}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Adicionar Cobrança</Text>
              <TouchableOpacity onPress={() => { resetForm(); setModalVisible(false); }}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={s.sectionTitle}>Dados da cobrança</Text>

              {/* Cliente */}
              <Text style={s.label}>Cliente</Text>
              <TextInput
                style={s.input}
                placeholder="Nome do cliente"
                value={cliente}
                onChangeText={setCliente}
              />

              {/* Forma de pagamento */}
              <Text style={s.label}>Forma de pagamento</Text>
              <TouchableOpacity
                style={s.select}
                onPress={() => { setShowFormaDropdown(v => !v); setShowParcelasDropdown(false); }}
              >
                <Text style={formaPagamento ? s.selectValue : s.selectPlaceholder}>
                  {formaPagamento || 'Selecione a forma de pagamento'}
                </Text>
                <Text style={s.arrow}>▾</Text>
              </TouchableOpacity>
              {showFormaDropdown && (
                <View style={s.dropdown}>
                  {FORMAS_PAGAMENTO.map(f => (
                    <TouchableOpacity
                      key={f}
                      style={[s.dropdownItem, formaPagamento === f && s.dropdownItemActive]}
                      onPress={() => { setFormaPagamento(f); setShowFormaDropdown(false); }}
                    >
                      <Text style={[s.dropdownText, formaPagamento === f && s.dropdownTextActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Valor */}
              <Text style={s.label}>Valor da cobrança</Text>
              <View style={s.inputWithPrefix}>
                <Text style={s.prefix}>R$</Text>
                <TextInput
                  style={s.inputInner}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={valorRaw}
                  onChangeText={handleValorChange}
                />
              </View>

              {/* Parcelas */}
              <Text style={s.label}>Parcelas</Text>
              <TouchableOpacity
                style={[s.select, valorTotal <= 0 && s.selectDisabled]}
                onPress={() => { if (valorTotal > 0) { setShowParcelasDropdown(v => !v); setShowFormaDropdown(false); } }}
              >
                <Text style={s.selectValue}>
                  {parcelasOptions[qtdParcelas - 1]?.label ?? 'À vista'}
                </Text>
                <Text style={s.arrow}>▾</Text>
              </TouchableOpacity>
              {showParcelasDropdown && (
                <View style={s.dropdown}>
                  {parcelasOptions.map(opt => (
                    <TouchableOpacity
                      key={opt.qtd}
                      style={[s.dropdownItem, qtdParcelas === opt.qtd && s.dropdownItemActive]}
                      onPress={() => { setQtdParcelas(opt.qtd); setShowParcelasDropdown(false); }}
                    >
                      <Text style={[s.dropdownText, qtdParcelas === opt.qtd && s.dropdownTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Vencimento */}
              <Text style={s.label}>Vencimento da {qtdParcelas > 1 ? '1ª parcela' : 'cobrança'}</Text>
              <TextInput
                style={s.input}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
                value={vencimento}
                onChangeText={handleVencimentoChange}
                maxLength={10}
              />

              {/* Preview de parcelas */}
              {valorTotal > 0 && qtdParcelas > 1 && vencimento.length === 10 && (
                <View style={s.previewBox}>
                  <Text style={s.previewTitle}>
                    {qtdParcelas}x de R$ {formatCurrency(valorTotal / qtdParcelas)} — Total R$ {formatCurrency(valorTotal)}
                  </Text>
                  {parcelas.map(p => (
                    <View key={p.numero} style={s.previewRow}>
                      <Text style={s.previewNum}>{p.numero}ª parcela</Text>
                      <Text style={s.previewValor}>R$ {formatCurrency(p.valor)}</Text>
                      <Text style={s.previewVenc}>{p.vencimento}</Text>
                    </View>
                  ))}
                </View>
              )}

              {valorTotal > 0 && qtdParcelas === 1 && (
                <View style={s.previewBox}>
                  <Text style={s.previewTitle}>
                    À vista — R$ {formatCurrency(valorTotal)}
                  </Text>
                </View>
              )}

              {/* Juros e multa */}
              <Text style={s.sectionTitle}>Juros e multa</Text>

              <View style={s.row}>
                <View style={s.half}>
                  <Text style={s.label}>Juros ao mês (%)</Text>
                  <View style={s.inputWithPrefix}>
                    <Text style={s.prefix}>%</Text>
                    <TextInput
                      style={s.inputInner}
                      placeholder="0,00"
                      keyboardType="numeric"
                      value={juros}
                      onChangeText={setJuros}
                    />
                  </View>
                </View>
                <View style={s.half}>
                  <Text style={s.label}>Multa por atraso (%)</Text>
                  <View style={s.inputWithPrefix}>
                    <Text style={s.prefix}>%</Text>
                    <TextInput
                      style={s.inputInner}
                      placeholder="0,00"
                      keyboardType="numeric"
                      value={multa}
                      onChangeText={setMulta}
                    />
                  </View>
                </View>
              </View>

              <View style={s.modalActions}>
                <TouchableOpacity
                  style={s.btnCancel}
                  onPress={() => { resetForm(); setModalVisible(false); }}
                >
                  <Text style={s.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnSalvar} onPress={handleSalvar}>
                  <Text style={s.btnSalvarText}>Adicionar cobrança</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const BLUE = '#1a56db';
const BLUE_LIGHT = '#e8f0fe';

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  addBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333' },
  emptySubtext: { fontSize: 14, color: '#888' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCliente: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgePendente: { backgroundColor: '#fef3c7' },
  badgePago: { backgroundColor: '#d1fae5' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#555' },
  cardValor: { fontSize: 22, fontWeight: '700', color: BLUE, marginTop: 4 },
  cardMeta: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 10 },
  parcelasList: { gap: 4 },
  parcelaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  parcelaNum: { width: 28, fontSize: 13, color: '#555', fontWeight: '600' },
  parcelaValor: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111' },
  parcelaVenc: { fontSize: 13, color: '#888' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '93%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  modalClose: { fontSize: 20, color: '#666', padding: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 8, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#fafafa',
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f0f2f5',
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    borderRightWidth: 1,
    borderRightColor: '#d0d5dd',
  },
  inputInner: { flex: 1, padding: 12, fontSize: 15, color: '#111' },
  select: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: 15, color: '#111' },
  selectPlaceholder: { fontSize: 15, color: '#aaa' },
  arrow: { fontSize: 14, color: '#666' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 99,
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: BLUE_LIGHT },
  dropdownText: { fontSize: 15, color: '#111' },
  dropdownTextActive: { color: BLUE, fontWeight: '600' },
  previewBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    gap: 6,
  },
  previewTitle: { fontSize: 14, fontWeight: '700', color: BLUE, marginBottom: 4 },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewNum: { width: 70, fontSize: 13, color: '#555', fontWeight: '600' },
  previewValor: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111' },
  previewVenc: { fontSize: 13, color: '#888' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  btnCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    alignItems: 'center',
  },
  btnCancelText: { fontSize: 15, color: '#444', fontWeight: '600' },
  btnSalvar: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: 'center',
  },
  btnSalvarText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
