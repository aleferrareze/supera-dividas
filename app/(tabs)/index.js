/* Arquivo: app.js - Design Refinado Estilo Apple */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function App() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [debts, setDebts] = useState('');
  const [result, setResult] = useState(null);
  const [buttonActive, setButtonActive] = useState(false);

  const formatNumber = (value) => {
    if (!value) return '';
    return parseFloat(value.replace(/[^0-9]/g, '') / 100)
      .toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const analyzeFinances = () => {
    let incomeValue = parseFloat(income.replace(/\./g, '').replace(',', '.'));
    let expensesValue = parseFloat(expenses.replace(/\./g, '').replace(',', '.'));
    let debtsValue = parseFloat(debts.replace(/\./g, '').replace(',', '.'));

    if (isNaN(incomeValue) || isNaN(expensesValue) || isNaN(debtsValue)) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    let riskScore = calculateDebtRisk(incomeValue, expensesValue, debtsValue);
    let plan = generateRestructuringPlan(incomeValue, expensesValue, debtsValue);

    setResult({ riskScore, plan });
    setButtonActive(true);
  };

  const clearFields = () => {
    setIncome('');
    setExpenses('');
    setDebts('');
    setResult(null);
    setButtonActive(false);
  };

  const calculateDebtRisk = (income, expenses, debts) => {
    let ratio = (expenses + debts) / income;
    return Math.min(Math.max(ratio * 100, 0), 100).toFixed(2);
  };

  const generateRestructuringPlan = (income, expenses, debts) => {
    let plan = {
      debtPayment: `💰 Destinar R$ ${(Math.min(income * 0.3, debts * 0.1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para pagamento de dívidas mensalmente.`,
      essentialSpending: `🏡 Manter gastos essenciais abaixo de R$ ${(income * 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      expenseReview: expenses > income * 0.5 ? "🔎 Rever gastos variáveis e cortar despesas desnecessárias." : null,
      savings: `📈 Guardar pelo menos R$ ${(income * 0.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por mês para emergência.`,
      personalizedTips: getPersonalizedTips(income, expenses, debts)
    };

    return plan;
  };

  const getPersonalizedTips = (income, expenses, debts) => {
    let ratio = (expenses + debts) / income;
    if (ratio > 1) {
      return { message: "Seu endividamento está crítico! Suas dívidas e gastos ultrapassam sua renda. Busque renegociar e cortar despesas.", backgroundColor: '#f8d7da', borderColor: '#f5c6cb', title: '🚨 Alerta Crítico' };
    } else if (ratio > 0.45) {
      return { message: "Seu endividamento está alto! Considere renegociar suas dívidas com os credores.", backgroundColor: '#fde8ec', borderColor: '#d9534f', title: '⚠️ Alerta' };
    } else if (ratio > 0.30) {
      return { message: "Seu endividamento está moderado. Tente reduzir gastos desnecessários.", backgroundColor: '#fff3cd', borderColor: '#ffeeba', title: '⚠️ Atenção' };
    } else {
      return { message: "Seu endividamento está sob controle. Continue assim!", backgroundColor: '#d4edda', borderColor: '#c3e6cb', title: '🎉 Parabéns' };
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headline}>💰 Programa S.U.P.E.R.A.</Text>
        <Text style={styles.title}>📊 Análise de Endividamento</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Renda Mensal" placeholderTextColor="#aaa" keyboardType="numeric" value={income} onChangeText={(value) => setIncome(formatNumber(value))} />
        <TextInput style={styles.input} placeholder="Gastos Mensais" placeholderTextColor="#aaa" keyboardType="numeric" value={expenses} onChangeText={(value) => setExpenses(formatNumber(value))} />
        <TextInput style={styles.input} placeholder="Dívidas Atuais" placeholderTextColor="#aaa" keyboardType="numeric" value={debts} onChangeText={(value) => setDebts(formatNumber(value))} />
      </View>

      <TouchableOpacity
        style={[styles.button, buttonActive && styles.buttonActive]}
        onPress={analyzeFinances}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>📄 Gerar Plano</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={clearFields}>
        <Text style={styles.clearButton}>Limpar Valores</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>🎯 Plano de Reestruturação</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Grau de Endividamento</Text>
            <Text style={styles.debtRisk}>{result.riskScore}%</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardText}>{result.plan.debtPayment}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardText}>{result.plan.essentialSpending}</Text>
          </View>

          {result.plan.expenseReview && (
            <View style={styles.card}>
              <Text style={styles.cardText}>{result.plan.expenseReview}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardText}>{result.plan.savings}</Text>
          </View>

          {result.plan.personalizedTips && (
            <View style={[styles.cardCritical, { backgroundColor: result.plan.personalizedTips.backgroundColor, borderColor: result.plan.personalizedTips.borderColor }]}>
              <Text style={styles.cardTitle}>{result.plan.personalizedTips.title}</Text>
              <Text style={styles.cardText}>{result.plan.personalizedTips.message}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.footer}>🚀 Desenvolvido por MF Advogados</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f2f2f7',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#666',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: 'white',
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007aff',
    padding: 16,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonActive: {
    backgroundColor: '#339aff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#007aff',
    fontSize: 16,
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    marginVertical: 8,
    elevation: 3,
    alignItems: 'center',
  },
  cardCritical: {
    padding: 20,
    borderRadius: 16,
    width: '90%',
    borderWidth: 1,
    marginVertical: 8,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 15,
    textAlign: 'center',
  },
  debtRisk: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d9534f',
    textAlign: 'center',
  },
  footer: {
    marginTop: 20,
    fontSize: 14,
    color: 'gray',
  },
});
