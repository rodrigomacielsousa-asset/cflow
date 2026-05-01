# Documentação Técnica: Receita Saúde Express (API-Ready)

Este documento descreve como o módulo **Receita Saúde Express** estrutura os dados para integração com sistemas de contabilidade ou webservices governamentais (e-CAC / Prefeituras).

## 1. Fluxo de Dados
O sistema opera como um Micro-SaaS "headless" opcional. Os dados são coletados via formulário Mobile-First e estruturados em um objeto JSON assinado digitalmente.

## 2. Estrutura do JSON (Payload)

```json
{
  "header": {
    "version": "2026.1",
    "timestamp": "2026-04-29T11:45:00Z",
    "origin": "C-Flow Receita Saúde Express"
  },
  "professional": {
    "name": "NOME DO PROFISSIONAL",
    "tax_id": "000.000.000-00",
    "registration": "CRP-06/12345",
    "address_fiscal": "Endereço Cadastrado no e-CAC"
  },
  "patient": {
    "name": "NOME DO PACIENTE",
    "tax_id": "111.111.111-11",
    "email": "paciente@email.com"
  },
  "service": {
    "date": "2026-04-29",
    "value": 150.00,
    "currency": "BRL",
    "code": "1.09",
    "description": "Prestação de serviço de Psicoterapia Individual"
  },
  "compliance": {
    "digital_signature": "sha256-hash-a4f5...e92d",
    "qr_code_url": "https://valida.receitasaude.express/v/a4f5"
  }
}
```

## 3. Modos de Integração

### A. Widget iframe
Clínicas podem incorporar o emissor em seus sites usando:
```html
<iframe src="https://cflow.app/receita-saude/widget?token=SEU_TOKEN" width="100%" height="600"></iframe>
```

### B. Webhook de Contabilidade
Ao emitir um recibo, o sistema pode disparar um POST para a URL configurada do contador:
`POST https://api.contabilidade.com/v1/receipts`

---
*Gerado por C-Flow Arquiteto de Software*
