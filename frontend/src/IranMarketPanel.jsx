import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, InputAdornment, LinearProgress, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import Refresh from '@mui/icons-material/Refresh';
import Search from '@mui/icons-material/Search';
import TrendingUp from '@mui/icons-material/TrendingUp';
import TrendingDown from '@mui/icons-material/TrendingDown';

const number = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
const units = { point: 'واحد شاخص', irr_kg: 'ریال / کیلوگرم', irr_ton: 'ریال / تن' };
const settings = {
 indices: { title: 'شاخص‌های بورس ایران', description: 'دیده‌بان شاخص‌های بورس تهران و فرابورس', value: 'مقدار شاخص', endpoint: 'indices' },
 commodities: { title: 'قیمت‌های بورس کالا', description: 'دیده‌بان محصولات صنعتی، معدنی و پتروشیمی', value: 'قیمت نمونه', endpoint: 'commodities' },
};
function Change({ value }) {
 const positive = value >= 0;
 return <Chip size="small" icon={positive ? <TrendingUp /> : <TrendingDown />} label={<span dir="ltr">{value > 0 ? '+' : ''}{number.format(value)}٪</span>} sx={{ color: positive ? '#16836a' : '#c14a5e', bgcolor: positive ? '#e9f7f1' : '#fceef1', fontWeight: 700 }} />;
}

export default function IranMarketPanel({ market }) {
 const config = settings[market];
 const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [query, setQuery] = useState('');
 const active = useRef(null);
 async function load() {
  active.current?.abort();
  const controller = new AbortController(); active.current = controller;
  setLoading(true); setError('');
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
   const response = await fetch(`/api/v1/iran/${config.endpoint}`, { signal: controller.signal });
   if (!response.ok) throw new Error('HTTP');
   const payload = await response.json();
   if (typeof payload.demo !== 'boolean' || !Number.isFinite(Date.parse(payload.updatedAt)) || !Array.isArray(payload.quotes) || payload.quotes.some(q => !Number.isFinite(q.value) || !Number.isFinite(q.changePercent) || typeof q.name !== 'string' || typeof q.symbol !== 'string' || typeof q.category !== 'string' || !units[q.unit])) throw new Error('Invalid quotes');
   if (active.current === controller) setData(payload);
  } catch {
   if (active.current === controller) setError('دریافت اطلاعات بازار انجام نشد. اتصال به سرور را بررسی کنید.');
  } finally {
   clearTimeout(timeout); if (active.current === controller) setLoading(false);
  }
 }
 useEffect(() => { load(); return () => { active.current?.abort(); active.current = null; }; }, []);
 const rows = (data?.quotes ?? []).filter(q => `${q.name} ${q.symbol} ${q.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 return <Box>
  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
   <Box><Typography variant="h4" sx={{ fontSize: { xs: 26, md: 34 }, mb: 1 }}>{config.title}</Typography><Typography color="text.secondary">{config.description}</Typography></Box>
   <Button variant="contained" startIcon={<Refresh />} disabled={loading} onClick={load} sx={{ alignSelf: 'flex-start' }}>به‌روزرسانی</Button>
  </Stack>
  <Alert severity="info" sx={{ mb: 3 }}>قیمت‌ها، مقادیر شاخص‌ها و درصد تغییرات این بخش ساختگی و صرفاً نمونه هستند؛ دادهٔ زندهٔ بازار نیستند. به‌روزرسانی، همان داده‌های نمونه را دوباره دریافت می‌کند.</Alert>
  {market === 'commodities' && <Alert severity="warning" sx={{ mb: 3 }}>قیمت هر عرضه به تولیدکننده، گرید، تاریخ عرضه و شرایط معامله وابسته است. اعداد این جدول قیمت رسمی عرضه یا معامله نیستند. واحد قیمت ریال است.</Alert>}
  {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" disabled={loading} onClick={load}>تلاش مجدد</Button>}>{error}{data && ' اطلاعات قبلی نمایش داده می‌شود.'}</Alert>}
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(4,1fr)' }, gap: 2.5, mb: 4 }}>
   {(data?.quotes.slice(0, 4) ?? [null, null, null, null]).map((q, i) => <Paper variant="outlined" key={q?.symbol ?? i} sx={{ p: 3, borderColor: '#e3e8f1' }}>
    <Typography fontWeight={700}>{q?.name ?? <Skeleton width={100} />}</Typography>
    <Typography variant="caption" color="text.secondary">{q?.category ?? '—'}</Typography>
    <Typography variant="h4" sx={{ fontSize: 28, my: 2, fontVariantNumeric: 'tabular-nums' }}>{q ? number.format(q.value) : <Skeleton />}</Typography>
    <Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="caption" color="text.secondary">{units[q?.unit] ?? '—'}</Typography>{q && <Change value={q.changePercent} />}</Stack>
   </Paper>)}
  </Box>
  <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: '#e3e8f1' }}>
   <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ p: 3 }}>
    <Typography variant="h6">{market === 'indices' ? 'دیده‌بان شاخص‌ها' : 'دیده‌بان بورس کالا'}</Typography>
    <TextField size="small" value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی نام، نماد یا گروه" slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }, htmlInput: { 'aria-label': 'جست‌وجوی بازار ایران' } }} />
   </Stack>
   {loading && <LinearProgress aria-label="دریافت اطلاعات بازار ایران" />}
   <TableContainer><Table sx={{ minWidth: 620 }} aria-label={config.title}>
    <TableHead sx={{ bgcolor: '#f8f9fc' }}><TableRow>{['نام / نماد', config.value, 'واحد', 'تغییر نمونه', 'بازار / گروه'].map(t => <TableCell key={t} sx={{ fontWeight: 700 }}>{t}</TableCell>)}</TableRow></TableHead>
    <TableBody>{rows.map(q => <TableRow hover key={q.symbol}><TableCell><Typography fontWeight={700}>{q.name}</Typography><Typography variant="caption" color="text.secondary">{q.symbol}</Typography></TableCell><TableCell sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{number.format(q.value)}</TableCell><TableCell>{units[q.unit]}</TableCell><TableCell><Change value={q.changePercent} /></TableCell><TableCell><Chip size="small" variant="outlined" label={q.category} /></TableCell></TableRow>)}
     {!loading && rows.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>{data ? 'موردی با این مشخصات پیدا نشد.' : 'هنوز اطلاعاتی دریافت نشده است.'}</TableCell></TableRow>}
    </TableBody>
   </Table></TableContainer>
   <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} sx={{ p: 2.5, bgcolor: '#fafbfd' }}>
    <Typography variant="caption" color="text.secondary">زمان دادهٔ نمونه: {data ? new Date(data.updatedAt).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }) : '—'} (تهران)</Typography>
    <Typography variant="caption" color="text.secondary">{number.format(rows.length)} مورد · داده‌های نمونه</Typography>
   </Stack>
  </Paper>
 </Box>;
}
