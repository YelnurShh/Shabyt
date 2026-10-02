import json,pathlib,re
out=[]
for f in sorted(pathlib.Path('content').glob('2*.json')):
 a=json.loads(f.read_text());desc=a[0];category=('Натюрморт' if 'натюрморт' in f.name else 'Анималистика' if 'анималистика' in f.name else 'Маринистік' if 'маринистік' in f.name else 'Тарихи жанр' if 'тарихи' in f.name else 'Пейзаж')
 def add(q,ans='',kind='riddle'):
  q=q.strip();ans=ans.strip().strip('.');
  if q:out.append({'id':str(len(out)+1),'category':category,'question':q,'answer':ans,'kind':kind,'source':f.name.replace('.json','.docx'),'description':desc})
 if category=='Тарихи жанр':
  for q in a[1:]:add(q,kind='proverb')
 elif category=='Пейзаж':
  answers=['Бұлт арасындағы ай','Бұлт пен найзағай','Бұлт пен жаңбыр','Күннің күркіреуі','Жаңбыр, найзағай','Жаңбыр, егінші','Кемпірқосақ','Ала бұлт','Найзағай','Жұлдыз','Көктем','Жаңбыр','Бұршақ','Тұман','Сағым','Боран','Бұлақ','Бұлт','Көл','Су','Күн','Ауа','Мұз','Аяз','Қар','Бу','Ай','Қыс','Күз','Жел']
  pat=re.compile('|'.join(map(re.escape,answers)))
  for text in a[1:]:
   start=0
   for m in pat.finditer(text):
    # Answers begin directly after punctuation or a lowercase word; don't split words in questions.
    if m.start() and (text[m.start()-1] in '.?!…»”' or (text[m.start()-1].islower() and text[m.start()-1] not in ' ')) and (m.end()==len(text) or text[m.end()].isupper()):
     add(text[start:m.start()],m.group());start=m.end()
   if text[start:].strip():add(text[start:])
 else:
  pending=[]
  for text in a[1:]:
   if text in ['***','Жұмбақтар']:continue
   m=re.search(r'(?:[Жж]ауабы\s*:?[ ]*|Ж:\s*)(.+)$',text)
   bracket=re.search(r'\(([^()]+)\)\s*$',text)
   if m or bracket:
    m=m or bracket;prefix=text[:m.start()].strip();pending.append(prefix) if prefix else None;add('\n'.join(pending),m.group(1));pending=[]
   elif category=='Натюрморт' and text.endswith('Егін, ішкен тамақ'):
    add('\n'.join(pending+[text[:-len('Егін, ішкен тамақ')]]),'Егін, ішкен тамақ');pending=[]
   elif category=='Натюрморт' and text.endswith('Жалбылша'):
    add('\n'.join(pending+[text[:-len('Жалбылша')]]),'Жалбылша');pending=[]
   elif category=='Натюрморт' and ('.' in text or '?' in text or '!' in text) and re.search(r'[.?!][^.!?]+$',text):
    idx=max(text.rfind('.'),text.rfind('?'),text.rfind('!'));q=text[:idx+1];ans=text[idx+1:];add('\n'.join(pending+[q]),ans);pending=[]
   else:pending.append(text)
  if pending:add('\n'.join(pending))
for r in out:
 r['question']=re.sub(r'([,.?!])(?=[А-ЯӘҒҚҢӨҰҮҺІа-яәғқңөұүһі])',r'\1\n',r['question'])
pathlib.Path('content/riddles.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
print('Records',len(out),'without answers',[(r['id'],r['question'][:80]) for r in out if not r['answer'] and r['kind']=='riddle'])
