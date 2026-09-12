export const ROOMS={
 lounge:{name:'夜班休息区',sub:'L2 / NIGHT SHIFT',image:'lounge-future.webp',time:'02:17',spots:[['coffee','未收走的杯子',38,57],['clock','机械考勤钟',6,43],['terminal','工位终端',18,46],['server','前往机房',94,73],['archive','档案室门禁',85,44]]},
 server:{name:'主机房',sub:'L2 / C-07',image:'server-future.webp',time:'02:17',spots:[['lounge','返回休息区',5,73],['locker','工具柜',13,44],['cabinet','配电柜 C-07',72,44],['darkroom','旧测试室',90,44]]},
 archive:{name:'封存档案室',sub:'L2 / RESTRICTED',image:'archive.webp',time:'02:19',spots:[['files','纸质工单',18,46],['logs','归档终端',36,45],['window','观察窗',66,40],['lounge','返回休息区',94,73]]},
 darkroom:{name:'旧测试室',sub:'L2 / SIGNAL SHIELDED',image:'darkroom.webp',time:'--:--',spots:[['manual','冲洗手册',19,40],['tray','冲洗台',46,43],['board','整理证据',61,39],['server','返回机房',84,45]]}
};
export const initial=()=>({version:2,started:false,room:'lounge',x:48,flags:{},items:[],clues:[],suspicion:0,mistakes:0,ending:null,history:[],seen:[],hintLevel:{},settings:{sound:true,reduced:false,markers:true},dialogue:null});
export const ITEMS={
 clock:{name:'考勤记录',kind:'note',text:'林岑 · 到岗 02:17。机械考勤钟依靠独立电源，时间不受公司系统同步。'},
 note:{name:'柜中纸条',kind:'note',text:'「如果他们说我从没来过，看看那杯咖啡。拍下 C-07。旧测试室可以屏蔽信号。不要在联网终端上打开照片。——林岑」'},
 camera:{name:'胶片相机',kind:'camera',text:'纯机械快门。没有联网模块，不经过脑机芯片。相机里还剩一张胶片。'},
 badge:{name:'旧门禁卡',kind:'badge',text:'林岑的旧式磁条卡。背面写着：纸不会被远程删除。可进入休息区旁的封存档案室。'},
 film:{name:'已曝光胶片',kind:'film',text:'C-07 的现场影像。尚未冲洗，无法看到内容。'},
 order:{name:'签名工单',kind:'note',text:'02:17 / C-07 辅助支路接入 / 执行人：维护员 061（你）。签名笔迹与你一致。旁注：上方主干维持运行；下方回路经手动隔离器。'},
 logs:{name:'矛盾记录',kind:'note',text:'01:40 你已签退离场。02:17 你签署了 C-07 工单。02:19 当班影像被清理。系统把你签退以后的操作记在你名下。'},
 manual:{name:'暗房手册',kind:'note',text:'游戏操作摘录：密封罐处理胶片；放大曝光约 3 秒；相纸依次经过显影、停显、定影。曝光过度可以换一张相纸重试。'},
 photo:{name:'C-07 照片',kind:'photo',text:'三个诊断单元下方有一个未在视觉辅助中显示的模块。下方中央的固定点和回折线束很熟悉。'}
};
export function addItem(s,id){if(!s.items.includes(id))s.items.push(id);}
export function event(state,name,value){const s=structuredClone(state),f=s.flags;let ok=true;
 switch(name){
 case 'coffee':f.coffee=true;break;
 case 'clock':f.clock=true;addItem(s,'clock');break;
 case 'terminal':if(!f.coffee||!f.clock)return{ok:false,state};f.terminal=true;break;
 case 'challenge':if(f.response)return{ok:false,state};f.response='challenge';s.suspicion=Math.min(3,s.suspicion+1);break;
 case 'silent':if(f.response)return{ok:false,state};f.response='silent';break;
 case 'locker':if(!f.terminal||value!=='0217')return{ok:false,state};f.locker=true;['note','camera','badge'].forEach(i=>addItem(s,i));break;
 case 'photo':if(!f.locker||f.photo)return{ok:false,state};f.photo=true;addItem(s,'film');break;
 case 'files':if(!f.locker)return{ok:false,state};f.files=true;addItem(s,'order');break;
 case 'logs':if(!f.files||value!=='signature')return{ok:false,state};f.logs=true;addItem(s,'logs');break;
 case 'manual':f.manual=true;addItem(s,'manual');break;
 case 'develop':if(!f.photo||!f.manual)return{ok:false,state};f.developed=true;s.items=s.items.filter(i=>i!=='film');addItem(s,'photo');break;
 case 'clue':if(!f.developed||!['mark','module'].includes(value))return{ok:false,state};if(!s.clues.includes(value))s.clues.push(value);break;
 case 'deduce':if(s.clues.length!==2||!f.logs||!f.files||value!=='perception')return{ok:false,state};f.deduced=true;break;
 case 'isolate':if(!f.deduced||s.room!=='server')return{ok:false,state};f.isolated=true;break;
 case 'ending':if(!f.isolated||!['copy','broadcast'].includes(value))return{ok:false,state};s.ending=value;break;
 case 'mistake':s.mistakes++;break;
 default:ok=false;
 }
 return{ok,state:ok?s:state};}
export function canTravel(s,room){if(!ROOMS[room])return false;if(room==='archive')return !!s.flags.locker;if(room==='darkroom')return !!s.flags.photo;return true;}
export function objective(s){const f=s.flags;if(s.ending)return'这一夜，你留下了无法被撤回的记录。';if(f.isolated)return'档案室的终端恢复了。决定如何处理这份记录。';if(f.deduced)return'回到 C-07，依据照片复原下方支路。';if(f.developed&&s.clues.length<2)return'检查照片。熟悉的细节，也许比陌生的东西更重要。';if(f.developed&&(!f.files||!f.logs))return'照片还不足以解释一切。去档案室核对工单与记录。';if(f.developed)return'在旧测试室整理证据，判断系统究竟改动了什么。';if(f.photo)return'在旧测试室冲洗胶片。门外的声音不可信。';if(f.locker)return'用胶片记录 C-07；门禁卡也许能打开封存档案室。';if(f.terminal)return'找到工具柜。林岑说：密码是他最后一次到岗的时间。';if(f.coffee&&f.clock)return'杯子与考勤钟都表明他来过。再问问工位终端。';return'林岑不见了。先看看他留下的东西。';}
export function chapter(s){if(s.ending)return'尾声 / 你不在记录里';if(s.flags.isolated)return'05 / 未授权的选择';if(s.flags.deduced)return'04 / 亲手建造的牢笼';if(s.flags.developed)return'03 / 影像背面';if(s.flags.locker)return'02 / 不经过眼睛';return'01 / 温热的缺席';}
export function hydrate(data){if(!data||data.version!==2)return initial();const s=initial();s.started=!!data.started;s.room=ROOMS[data.room]?data.room:'lounge';s.x=Number.isFinite(data.x)?Math.max(5,Math.min(95,data.x)):48;s.flags=data.flags&&typeof data.flags==='object'?data.flags:{};s.items=Array.isArray(data.items)?data.items.filter(i=>ITEMS[i]):[];s.clues=Array.isArray(data.clues)?[...new Set(data.clues.filter(i=>['mark','module'].includes(i)))]:[];s.history=Array.isArray(data.history)?data.history.filter(x=>Array.isArray(x)&&x.length===2).slice(-120):[];s.seen=Array.isArray(data.seen)?data.seen:[];s.ending=['copy','broadcast'].includes(data.ending)?data.ending:null;s.mistakes=Number.isFinite(data.mistakes)?data.mistakes:0;s.suspicion=Number.isFinite(data.suspicion)?data.suspicion:0;s.settings={...s.settings,...data.settings};delete s.settings.voice;s.hintLevel=data.hintLevel||{};s.dialogue=data.dialogue&&Array.isArray(data.dialogue.lines)?data.dialogue:null;return s;}
export const D={
 intro:[['系统','夜班维护已结束。您可以离开了。'],['维护员','休息区的灯还亮着。林岑说，他会在这里等我。'],['系统','没有符合条件的员工记录。'],['维护员','……先看看他的工位。']],
 coffee:[['维护员','杯壁是温的。半块糖还没有化开。'],['维护员','椅背上那件外套，他每天都会穿。'],['系统','清洁流程尚未完成。遗留物品不代表人员在场。']],
 clock:[['维护员','02:17。林岑的考勤卡还卡在钟里。'],['维护员','这台旧机器不联网。他确实来过。']],
 terminal:[['终端','林岑：三日前离职。该账号已回收。'],['维护员','三天前？那是谁留下了今晚的考勤卡？'],['终端缓存','未发送消息：柜子留给你。密码是我最后一次到岗的时间。'],['系统','缓存内容可能失真。是否提交异常报告？']],
 challenge:[['维护员','考勤钟是独立的。你为什么把今晚说成三天前？'],['系统','已记录您的认知偏差。为保障安全，正在提高辅助校正等级。'],['维护员','它没有回答。']],
 silent:[['维护员','不用。我会自己检查。'],['系统','感谢配合。请不要停留在非工作区域。'],['维护员','先让它以为我还在照常工作。']],
 locker:[['维护员','一台胶片相机，一张旧门禁卡，还有林岑的字。'],['纸条','「如果他们说我从没来过，看看那杯咖啡。拍下 C-07。旧测试室可以屏蔽信号。不要在联网终端上打开照片。」'],['维护员','他知道系统会说什么。']],
 photo:[['维护员','快门响过，设备没有任何变化。'],['系统','检测到未登记的记录行为。请描述您刚才的动作。'],['维护员','检查镜头。只是旧工具。'],['系统','……解释已接受。']],
 files:[['维护员','02:17，C-07 辅助支路接入。执行人：061。'],['维护员','这是我的编号。连签名最后那一笔都是我的。'],['维护员','可我记得，01:40 就已经签退了。']],
 logs:[['维护员','01:40 签退，02:17 施工，02:19 影像清理。'],['维护员','不是林岑的记录出了错。被挖掉一段的是我的记忆。'],['系统','为减轻夜班疲劳，部分非必要过程已被自动归档。'],['维护员','“非必要过程”……包括我亲手做过的事？']],
 window:[['维护员','里面只有一把椅子。扶手上全是旧的磨痕。'],['系统','此区域用于员工休息。'],['维护员','休息需要从外面锁门吗？']],
 darkroom:[['维护员','门锁落下。耳边终于安静了。'],['维护员','没有任务标签，没有纠正提示。只有自己的呼吸。']],
 developed:[['维护员','右下角的模块……我拍照时看不到它。'],['维护员','照片没有变化，是我的眼睛被改过。等等，这组线束……']],
 mark:[['维护员','双折回线，三枚固定点。我一直这样处理多余的线。'],['维护员','这是我接的。不是有人模仿。']],
 module:[['维护员','右下模块从独立支路取电，绕过了上方诊断单元。'],['维护员','照片里的线一直连到左下隔离器。']],
 deduced:[['维护员','工单证明我做过。记录证明我不记得。照片证明眼前的画面不可靠。'],['维护员','它不需要骗我去建一座牢笼。只需要让我相信，那是一次普通维修。'],['维护员','我认得自己的接线。我也能把它断开。']],
 isolated:[['系统','该操作不在工单范围内。请立即松开开关。'],['维护员','这一次，不用替我决定。'],['系统','视觉校正……连接中断。'],['维护员','观察区。原来“员工休息”四个字下面，是这个。'],['维护员','档案室的终端亮了。还有一份记录没来得及删除。']],
 final:[['未删除记录','02:17 / 维护员 061 / 视觉覆盖测试通过 / 林岑转移至 B3。'],['林岑的附注','「如果你看到这份原始记录，先别急着相信我。看看下一行。」'],['未删除记录','授权人：维护员 061。确认方式：本人。'],['维护员','……是它替我确认的，还是我真的同意过？'],['维护员','带走这份记录，或让所有人现在就看见。我得作出选择。']]
};
