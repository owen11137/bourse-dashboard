import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, InputAdornment, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Refresh from '@mui/icons-material/Refresh';
import Search from '@mui/icons-material/Search';
const groups = { gold: 'طلا و سکه', currency: 'ارز', cryptocurrency: 'رمزارز' };
const number = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 10 });
const percent = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });
const numericFields = ['price', 'change_percent', 'time_unix'];
export default function GoldCurrencyPanel() {
 const [data, setData] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [query, setQuery] = useState(''), [group, setGroup] = useState('all');
 const active = useRef(null);
 async function load() {
  active.current?.abort(); const controller = new AbortController(); active.current = controller;
  setLoading(true); setError(''); const timeout = setTimeout(() => controller.abort(), 15000);
  try {
   const response = await fetch('/api/v1/markets/gold-currency', { signal: controller.signal });
   if (!response.ok) throw new Error(response.status === 503 ? 'کلید BrsAPI در سرور تنظیم نشده است.' : 'دریافت اطلاعات از BrsAPI انجام نشد.');
   const payload = await response.json();
   for (const key of Object.keys(groups)) {
    if (!Array.isArray(payload[key]) || payload[key].some(q => ['name', 'name_en', 'symbol', 'unit', 'date', 'time'].some(f => typeof q[f] !== 'string') || [...numericFields, ...(key === 'cryptocurrency' ? ['market_cap'] : ['change_value'])].some(f => q[f] == null || q[f] === '' || !Number.isFinite(Number(q[f]))))) throw new Error('ساختار اطلاعات دریافتی معتبر نیست.');
   }
   if (active.current === controller) setData(payload);
  } catch (e) {
   if (active.current === controller) setError(e.name === 'AbortError' ? 'زمان دریافت اطلاعات به پایان رسید؛ دوباره تلاش کنید.' : e.message);
  } finally { clearTimeout(timeout); if (active.current === controller) setLoading(false); }
 }
 useEffect(() => { load(); return () => { active.current?.abort(); active.current = null; }; }, []);
 const search = query.trim().toLocaleLowerCase();
 const total = data ? Object.keys(groups).reduce((n, k) => n + data[k].length, 0) : 0;
 return <Box>
  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
   <Box><Typography variant="h4" sx={{ mb: 1 }}>طلا و ارز</Typography><Typography color="text.secondary">همهٔ قیمت‌های طلا، سکه، ارز و رمزارز از BrsAPI</Typography></Box>
   <Button variant="contained" onClick={load} disabled={loading} startIcon={<Refresh />} sx={{ alignSelf: 'flex-start' }}>به‌روزرسانی</Button>
  </Stack>
  <Alert severity="info" sx={{ mb: 3 }}>واحد هر قیمت طبق منبع نمایش داده می‌شود؛ تومان و دلار با هم تبدیل نمی‌شوند. زمان هر ردیف، زمان ثبت همان داده در منبع است. پاسخ‌ها تا ۶۰ ثانیه کش می‌شوند و لحظه‌ای بودن داده تضمین نمی‌شود.</Alert>
  {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" disabled={loading} onClick={load}>تلاش مجدد</Button>}>{error}{data && ' اطلاعات قبلی نمایش داده می‌شود.'}</Alert>}
  <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
   <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
    <ToggleButtonGroup exclusive value={group} onChange={(_, v) => v && setGroup(v)} size="small" aria-label="گروه قیمت‌ها" sx={{ flexWrap: 'wrap' }}><ToggleButton value="all">همه</ToggleButton>{Object.entries(groups).map(([k, title]) => <ToggleButton value={k} key={k}>{title}</ToggleButton>)}</ToggleButtonGroup>
    <TextField size="small" value={query} onChange={e => setQuery(e.target.value)} placeholder="جست‌وجوی نام یا نماد" slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }, htmlInput: { 'aria-label': 'جست‌وجوی طلا و ارز' } }} />
   </Stack>
   <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>منبع: BrsAPI · {number.format(total)} مورد دریافت‌شده</Typography>
  </Paper>
  {loading && <LinearProgress aria-label="دریافت طلا و ارز" sx={{ mb: 2 }} />}
  {Object.entries(groups).filter(([k]) => group === 'all' || group === k).map(([key, title]) => {
   const rows = (data?.[key] ?? []).filter(q => `${q.name} ${q.name_en} ${q.symbol}`.toLocaleLowerCase().includes(search));
   return <Paper key={key} variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
    <Stack direction="row" justifyContent="space-between" sx={{ p: 2.5 }}><Typography variant="h6">{title}</Typography><Chip size="small" label={`${number.format(rows.length)} مورد`} /></Stack>
    <TableContainer><Table aria-label={title} sx={{ minWidth: 1000 }}>
     <TableHead sx={{ bgcolor: '#f8f9fc' }}><TableRow>{['نام / نماد', 'نام انگلیسی', 'قیمت', 'واحد قیمت', ...(key === 'cryptocurrency' ? ['ارزش بازار (دلار)'] : ['مقدار تغییر']), 'درصد تغییر', 'تاریخ منبع', 'ساعت منبع', 'زمان یونیکس', ...(key === 'cryptocurrency' ? ['توضیحات'] : [])].map(t => <TableCell key={t} sx={{ fontWeight: 700 }}>{t}</TableCell>)}</TableRow></TableHead>
     <TableBody>{rows.map(q => {
      const change = Number(q.change_percent); const color = change > 0 ? '#16836a' : change < 0 ? '#c14a5e' : 'text.secondary';
      return <TableRow key={q.symbol} hover>
       <TableCell><Typography fontWeight={700}>{q.name}</Typography><Typography variant="caption" color="text.secondary" component="div" dir="ltr">{q.symbol}</Typography></TableCell>
       <TableCell><span dir="ltr">{q.name_en}</span></TableCell>
       <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{number.format(Number(q.price))}</TableCell><TableCell>{q.unit}</TableCell>
       <TableCell sx={{ color, whiteSpace: 'nowrap' }}><span dir="ltr">{key === 'cryptocurrency' ? number.format(Number(q.market_cap)) : <>{Number(q.change_value) > 0 ? '+' : ''}{number.format(Number(q.change_value))}</>}</span></TableCell>
       <TableCell><Chip size="small" sx={{ color, bgcolor: change >= 0 ? '#e9f7f1' : '#fceef1' }} label={<span dir="ltr">{change > 0 ? '+' : ''}{percent.format(change)}٪</span>} /></TableCell>
       <TableCell><span dir="ltr">{q.date}</span></TableCell><TableCell><span dir="ltr">{q.time}</span></TableCell><TableCell><span dir="ltr">{q.time_unix}</span></TableCell>{key === 'cryptocurrency' && <TableCell sx={{ minWidth: 280 }}>{q.description ?? '—'}</TableCell>}
      </TableRow>;
     })}{!loading && rows.length === 0 && <TableRow><TableCell colSpan={key === 'cryptocurrency' ? 10 : 9} align="center" sx={{ py: 4 }}>{data ? 'موردی با این مشخصات پیدا نشد.' : 'هنوز اطلاعاتی دریافت نشده است.'}</TableCell></TableRow>}</TableBody>
    </Table></TableContainer>
   </Paper>;
  })}
 </Box>;
}
