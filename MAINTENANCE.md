# 🔧 Guia de Manutenção - Sistema Radar

## 📊 Monitoramento Diário

### Status das Aplicações
```bash
# Ver status de todas as aplicações
pm2 status

# Informações detalhadas
pm2 info radar-api
pm2 info radar-frontend

# Monitoramento em tempo real
pm2 monit
```

### Logs
```bash
# Logs em tempo real
pm2 logs

# Logs específicos
pm2 logs radar-api
pm2 logs radar-frontend

# Últimas 100 linhas
pm2 logs --lines 100

# Logs com timestamp
pm2 logs --timestamp

# Limpar logs antigos
pm2 flush
```

### Uso de Recursos
```bash
# CPU e Memória
pm2 monit

# Uso detalhado
htop

# Espaço em disco
df -h

# Uso de disco por diretório
du -sh /home/ativos-radardadosapi/htdocs/*
du -sh /home/ativos-radardados/htdocs/*
```

---

## 🔄 Operações Comuns

### Reiniciar Aplicações
```bash
# Reiniciar back-end
pm2 restart radar-api

# Reiniciar front-end
pm2 restart radar-frontend

# Reiniciar todas
pm2 restart all

# Reiniciar com zero downtime
pm2 reload radar-api
pm2 reload radar-frontend
```

### Parar/Iniciar
```bash
# Parar
pm2 stop radar-api
pm2 stop radar-frontend

# Iniciar
pm2 start radar-api
pm2 start radar-frontend

# Deletar do PM2
pm2 delete radar-api
pm2 delete radar-frontend
```

### Atualizar Aplicação
```bash
# Back-end
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
git pull
./deploy.sh

# Front-end
cd /home/ativos-radardados/htdocs/radardados.ativos.com
git pull
./deploy.sh
```

---

## 🗄️ Banco de Dados

### Backup
```bash
# Backup completo
mysqldump -u radar_user -p radar_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup compactado
mysqldump -u radar_user -p radar_production | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup apenas estrutura
mysqldump -u radar_user -p --no-data radar_production > structure_$(date +%Y%m%d).sql

# Backup apenas dados
mysqldump -u radar_user -p --no-create-info radar_production > data_$(date +%Y%m%d).sql
```

### Restaurar Backup
```bash
# Restaurar backup
mysql -u radar_user -p radar_production < backup_20241124_172500.sql

# Restaurar backup compactado
gunzip < backup_20241124_172500.sql.gz | mysql -u radar_user -p radar_production
```

### Manutenção do Banco
```bash
# Conectar ao MySQL
mysql -u radar_user -p radar_production

# Otimizar tabelas
OPTIMIZE TABLE precatorio;
OPTIMIZE TABLE ente;
OPTIMIZE TABLE aporte;

# Verificar integridade
CHECK TABLE precatorio;

# Reparar tabela (se necessário)
REPAIR TABLE precatorio;

# Ver tamanho das tabelas
SELECT 
    table_name AS 'Tabela',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tamanho (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'radar_production'
ORDER BY (data_length + index_length) DESC;
```

---

## 🔐 Segurança

### Atualizar Dependências
```bash
# Back-end
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
npm audit
npm audit fix
npm update

# Front-end
cd /home/ativos-radardados/htdocs/radardados.ativos.com
npm audit
npm audit fix
npm update
```

### Verificar Vulnerabilidades
```bash
# Scan de segurança
npm audit

# Ver detalhes
npm audit --json

# Corrigir automaticamente (cuidado!)
npm audit fix
```

### Logs de Acesso
```bash
# Nginx - Últimos acessos
sudo tail -f /var/log/nginx/access.log

# Nginx - Erros
sudo tail -f /var/log/nginx/error.log

# Filtrar por IP
grep "192.168.1.100" /var/log/nginx/access.log

# Contar requisições por IP
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20
```

---

## 📈 Performance

### Análise de Performance
```bash
# Tempo de resposta da API
curl -w "@curl-format.txt" -o /dev/null -s https://radardadosapi.ativos.com/

# Criar arquivo curl-format.txt:
cat > curl-format.txt << EOF
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### Otimização
```bash
# Limpar cache do Next.js
cd /home/ativos-radardados/htdocs/radardados.ativos.com
rm -rf .next/cache

# Rebuild otimizado
npm run build

# Reiniciar
pm2 restart radar-frontend
```

---

## 🧹 Limpeza

### Logs Antigos
```bash
# Limpar logs do PM2
pm2 flush

# Limpar logs do Nginx (cuidado!)
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log

# Ou rotacionar logs
sudo logrotate -f /etc/logrotate.d/nginx
```

### Arquivos Temporários
```bash
# Limpar node_modules e reinstalar
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com
rm -rf node_modules
npm install --production

# Limpar cache do npm
npm cache clean --force
```

### Espaço em Disco
```bash
# Ver arquivos grandes
find /home -type f -size +100M -exec ls -lh {} \;

# Limpar backups antigos (manter últimos 7 dias)
find /home/*/backups -name "*.sql" -mtime +7 -delete
```

---

## 🔄 Migrations do Prisma

### Aplicar Nova Migration
```bash
cd /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com

# Ver status das migrations
npx prisma migrate status

# Aplicar migrations pendentes
npm run prisma:migrate:deploy

# Gerar novo Prisma Client
npm run prisma:generate

# Reiniciar aplicação
pm2 restart radar-api
```

### Rollback de Migration (Emergência)
```bash
# Restaurar backup do banco ANTES da migration
mysql -u radar_user -p radar_production < backup_antes_migration.sql

# Reverter código
git checkout <commit-anterior>

# Rebuild e reiniciar
npm run build
pm2 restart radar-api
```

---

## 🚨 Troubleshooting

### Aplicação Não Responde
```bash
# 1. Ver logs
pm2 logs radar-api --lines 200

# 2. Verificar se está rodando
pm2 status

# 3. Verificar porta
netstat -tulpn | grep 3030

# 4. Reiniciar
pm2 restart radar-api

# 5. Se não resolver, deletar e reiniciar
pm2 delete radar-api
pm2 start ecosystem.config.js
```

### Erro de Memória
```bash
# Ver uso de memória
pm2 monit

# Aumentar limite no ecosystem.config.js
max_memory_restart: '1G'  # Aumentar para 1GB

# Reiniciar
pm2 restart radar-api
```

### Erro de Conexão com Banco
```bash
# Testar conexão
mysql -u radar_user -p radar_production

# Verificar se MySQL está rodando
sudo systemctl status mysql

# Reiniciar MySQL (cuidado!)
sudo systemctl restart mysql

# Ver logs do MySQL
sudo tail -f /var/log/mysql/error.log
```

### CORS Error
```bash
# Verificar FRONTEND_URL no .env do back-end
cat /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com/.env | grep FRONTEND_URL

# Deve ser: FRONTEND_URL=https://radardados.ativos.com

# Se precisar alterar
nano /home/ativos-radardadosapi/htdocs/radardadosapi.ativos.com/.env

# Reiniciar
pm2 restart radar-api
```

---

## 📊 Relatórios

### Uptime
```bash
# Uptime do servidor
uptime

# Uptime das aplicações PM2
pm2 list
```

### Estatísticas de Uso
```bash
# Requisições por hora (Nginx)
awk '{print $4}' /var/log/nginx/access.log | cut -d: -f1-2 | sort | uniq -c

# IPs únicos por dia
awk '{print $1}' /var/log/nginx/access.log | sort -u | wc -l

# Status codes
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
```

---

## 🔔 Alertas e Notificações

### Configurar Alertas PM2
```bash
# Instalar PM2 Plus (opcional)
pm2 plus

# Configurar alertas por email
pm2 set pm2:email your@email.com
pm2 set pm2:alert-on-restart true
pm2 set pm2:alert-on-error true
```

---

## 📅 Tarefas Periódicas

### Diariamente
- [ ] Verificar `pm2 status`
- [ ] Verificar logs de erro
- [ ] Verificar espaço em disco

### Semanalmente
- [ ] Backup do banco de dados
- [ ] Revisar logs de acesso
- [ ] Verificar atualizações de segurança

### Mensalmente
- [ ] Atualizar dependências (`npm update`)
- [ ] Limpar logs antigos
- [ ] Revisar performance
- [ ] Testar restore de backup

---

## 📞 Contatos de Emergência

**Desenvolvedor:** ___________________
**Telefone:** ___________________
**Email:** ___________________

**Suporte Servidor:** ___________________
**Telefone:** ___________________

**Suporte CloudPanel:** ___________________
