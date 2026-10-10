/**
 * story.js — 剧情数据
 * 七幕剧情：旁白 / 人物对话 / 答题 / 地理知识卡 / 地图互动 / 三维现场
 *
 * 字段说明
 *   narrate  { bg, text }
 *   dialog   { bg, speaker, role, charLeft, charRight, text }
 *   quiz     { question, options:[{label,text,correct}], explanation }
 *   geo      { title, icon, images:[图片路径], content:HTML }
 *   map      { instruction, highlight:地点id }
 *   scene3d  { sceneName, label, caption }
 *   bg 取值见 engine.js 的 BG_IMAGES；人物 id 见 CHAR_IMAGES
 */

window.STORY = {

  chapters: [

    /* ══════════════════════════════════════════════════════
       第一幕：战略转移的开始
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch1',
      title: '战略转移的开始',
      subtitle: '1933年秋 — 1934年10月 · 江西瑞金',
      mapFocus: 'ruijin',
      steps: [

        { type: 'narrate', bg: 'autumn_forest',
          text: '1933年9月，蒋介石调集50万兵力，对中央革命根据地发动第五次“围剿”。这一次，他放弃了以往的“长驱直入”，改用德国顾问提出的“堡垒政策”——步步为营，修筑数千座碉堡，层层压缩苏区。' },

        { type: 'narrate', bg: 'autumn_forest',
          text: '此时的中央苏区，红军主力约8万余人。而指挥权，掌握在中共临时中央负责人博古和共产国际军事顾问李德手中。' },

        { type: 'dialog', bg: 'command_room', speaker: '博古', role: '中共临时中央负责人',
          charLeft: 'bolin',
          text: '敌人要来，我们就把他挡在门外！命令各部坚守阵地，寸土不让——“御敌于国门之外”，决不让敌人踏进根据地一步！' },

        { type: 'dialog', bg: 'command_room', speaker: '李德', role: '共产国际军事顾问',
          charRight: 'lide',
          text: '对。以集中对集中，以堡垒对堡垒。我们有八万红军，完全可以和敌人拼消耗，打一场正规的阵地战！' },

        { type: 'dialog', bg: 'command_room', speaker: '周恩来', role: '中央政治局常委 · 红军总政委',
          charLeft: 'zhou',
          text: '可是……敌人有飞机、大炮和充足的弹药，我们只有步枪和手榴弹。这样拼消耗，代价恐怕承受不起。' },

        { type: 'dialog', bg: 'command_room', speaker: '毛泽东', role: '中央政治局委员',
          charRight: 'mao',
          text: '前四次反“围剿”，我们靠的是诱敌深入、运动战——把敌人放进来，在运动中一口一口吃掉它。现在丢掉自己的长处，去和敌人拼堡垒、拼消耗，这是拿红军的命去换。' },

        { type: 'narrate', bg: 'battle_field',
          text: '毛泽东的正确主张没有被采纳。红军与装备占绝对优势的敌军硬拼阵地，苦战一年，伤亡惨重，根据地日益缩小。1934年4月广昌失守，苏区北大门洞开。' },

        { type: 'narrate', bg: 'battle_field',
          text: '1934年10月，中央红军8万多人被迫撤离中央革命根据地，开始了后来举世闻名的战略转移——长征。' },

        { type: 'geo', title: '江西瑞金 — 中央苏区', icon: '🏔',
          images: ['assets/photo/assembly.webp'],
          content: `
            <h4>地理位置</h4>
            <p>瑞金位于江西省东南部，地处<strong>武夷山脉西麓</strong>，地形以山地、丘陵为主，地势起伏、林木茂密，天然利于游击战与隐蔽转移。</p>
            <h4>自然条件</h4>
            <ul>
              <li>属<strong>亚热带湿润季风气候</strong>，年降水量1600毫米以上，温暖湿润</li>
              <li>境内绵江（绵水）流经，为当地重要水系，最终汇入赣江</li>
              <li>山岭纵横、沟谷深切，为根据地提供天然屏障</li>
            </ul>
            <h4>历史意义</h4>
            <p>1931年11月，中华苏维埃共和国临时中央政府在瑞金成立，瑞金因此被称为<strong>“红色故都”</strong>。1934年10月，中央红军从这里出发开始长征。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【瑞金】，找到中央红军长征的出发地', highlight: 'ruijin' },

        { type: 'quiz',
          question: '中央红军第五次反“围剿”失败的根本原因是什么？',
          options: [
            { label: 'A', text: '国民党军队兵力过于强大', correct: false },
            { label: 'B', text: '博古、李德等人的“左”倾错误——以阵地战代替运动战', correct: true },
            { label: 'C', text: '红军武器装备落后', correct: false },
            { label: 'D', text: '苏联停止援助中国革命', correct: false }
          ],
          explanation: '根本原因是博古、李德等人推行“左”倾教条主义，用阵地战、堡垒战去对抗拥有飞机大炮的国民党军，丢掉了前四次反“围剿”行之有效的运动战。兵力悬殊只是客观条件，不是根本原因。' },

        { type: 'quiz',
          question: '中央红军开始长征的时间是？',
          options: [
            { label: 'A', text: '1933年9月', correct: false },
            { label: 'B', text: '1934年10月', correct: true },
            { label: 'C', text: '1935年1月', correct: false },
            { label: 'D', text: '1936年10月', correct: false }
          ],
          explanation: '1933年9月是第五次“围剿”开始；1934年10月中央红军从瑞金、于都出发开始战略转移；1935年1月召开遵义会议；1936年10月三大主力会师，长征结束。' }
      ]
    },

    /* ══════════════════════════════════════════════════════
       第二幕：血战湘江
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch2',
      title: '血战湘江',
      subtitle: '1934年11月—12月 · 湘江之畔',
      mapFocus: 'xiangjiang',
      steps: [

        { type: 'narrate', bg: 'river_night',
          text: '出发后的红军，带上了印钞机、兵工机器、坛坛罐罐，队伍一天只能走二三十里——这就是被后人诟病的“大搬家”式转移。而蒋介石，已经在红军西进的路上设下了四道封锁线。' },

        { type: 'narrate', bg: 'river_night',
          text: '红军连续突破三道封锁线，损失越来越大。1934年11月底，第四道封锁线横在面前——湘江。蒋介石调集30余万兵力在这里布下口袋，扬言要把红军“歼灭于湘江以东”。' },

        { type: 'dialog', bg: 'river_night', speaker: '红军战士', role: '湘江渡口',
          charLeft: 'soldier',
          text: '同志们，渡江！为了革命，冲过去！敌人的炮火挡不住我们！' },

        { type: 'narrate', bg: 'river_blood',
          text: '血战三昼夜。红军将士用血肉之躯挡住了敌人的飞机大炮，主力渡过了湘江。可代价是——由出发时的8.6万人，锐减到3万余人。' },

        { type: 'narrate', bg: 'river_blood',
          text: '湘江水被染成红色，江面漂满红军将士的遗体。当地百姓为纪念死难红军，流传下这样一句话：“三年不饮湘江水，十年不食湘江鱼。”' },

        { type: 'geo', title: '湘江 — 为什么这里成了“天堑”', icon: '🌊',
          images: ['assets/event/xiangjiang-map.webp'],
          content: `
            <h4>河流基本信息</h4>
            <p>湘江是长江的重要支流，发源于广西灵川，由南向北纵贯湖南全境，全长856千米，流域面积约9.4万平方千米，最终注入洞庭湖。</p>
            <h4>水文特征</h4>
            <ul>
              <li>河面宽约 <strong>300—500米</strong>，冬季水位虽低，流速仍然较快</li>
              <li>两岸为丘陵地形，便于敌军居高临下布置火力封锁</li>
              <li>渡口少而集中，数万大军只能从有限的几个点抢渡，极易被封锁</li>
            </ul>
            <h4>战略意义</h4>
            <p>湘江是红军向西北转移必须跨越的第一道大障碍。突破湘江，红军才冲出了敌人在华南的包围圈；但湘江之战也让红军元气大伤，直接催生了后来对错误军事路线的深刻反思。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【湘江战役】，看看这道“天堑”在哪里', highlight: 'xiangjiang' },

        { type: 'quiz',
          question: '湘江战役后，中央红军人数从出发时的约多少减少至多少？',
          options: [
            { label: 'A', text: '从10万减至5万', correct: false },
            { label: 'B', text: '从8.6万减至3万余人', correct: true },
            { label: 'C', text: '从6万减至2万', correct: false },
            { label: 'D', text: '从12万减至4万', correct: false }
          ],
          explanation: '中央红军从江西出发时约8.6万人，湘江战役后仅剩3万余人，损失超过一半，是长征途中最惨烈的一仗。' }
      ]
    },

    /* ══════════════════════════════════════════════════════
       第三幕：遵义会议
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch3',
      title: '遵义会议',
      subtitle: '1934年12月 — 1935年1月 · 贵州遵义',
      mapFocus: 'zunyi',
      is3D: true,
      scene3D: 'zunyi_meeting',
      steps: [

        { type: 'narrate', bg: 'guizhou_mist',
          text: '湘江之后，红军只剩下3万余人。下一步往哪里走？博古、李德坚持按原计划北上湘西，与红二、六军团会合。' },

        { type: 'narrate', bg: 'guizhou_mist',
          text: '可蒋介石早已判断出红军的意图，在湘西布下了十几万重兵，张网以待。1934年12月，红军占领湖南通道，一场决定全军命运的会议在这里召开。' },

        { type: 'dialog', bg: 'command_room', speaker: '毛泽东', role: '中央政治局委员',
          charLeft: 'mao',
          text: '不能再去湘西了。敌人张好了网，我们只剩三万人，再撞上去就是全军覆没。贵州方向敌人兵力薄弱——我们应当果断改向贵州，打几个胜仗，让部队喘一口气。' },

        { type: 'dialog', bg: 'command_room', speaker: '周恩来', role: '中央政治局常委',
          charRight: 'zhou',
          text: '侦察报告证实了这一点：湘西方向敌人已集结完毕。我同意毛泽东同志的意见，改向贵州。' },

        { type: 'narrate', bg: 'guizhou_mist',
          text: '通道会议采纳了毛泽东的建议，红军改向敌人力量薄弱的贵州前进，史称“通道转兵”。这一转向，让红军避开了敌人的口袋阵。随后红军强渡乌江天险，攻占了遵义城。' },

        /* ── 三维现场：遵义会议（自由探索 / 自动模式都在会场里） ── */
        { type: 'scene3d', sceneName: 'zunyi_meeting',
          label: '遵义会议会址 · 楼上客厅',
          caption: '1935年1月15日—17日，中共中央政治局扩大会议在此召开',
          enterText: '1935年1月15日至17日，中共中央在遵义召开政治局扩大会议。会址是遵义老城的一栋两层小楼，原是黔军师长柏辉章的官邸。楼上客厅里，一场关系到党和红军生死存亡的讨论开始了。',
          task: '点击会场中的每个人物，听他们各自的主张',
          hint: '也可以直接点击画面里的人物，或拖动鼠标环视会场',
          intro: [
            { speaker: '旁白', role: '遵义会议 · 楼上客厅', narr: true,
              text: '楼上客厅里，一张长桌，几把木椅，一盏油灯。二十位与会者围着长桌坐下——博古代表中央作关于第五次反“围剿”的报告，气氛凝重。' }
          ],
          cast: [
            { id: 'bogu', name: '博古', role: '中共临时中央负责人', stance: '按原计划北上',
              lines: [
                { speaker: '博古', role: '中共临时中央负责人',
                  text: '……第五次反“围剿”之所以失败，主要是敌人力量过于强大，客观条件不具备。我们在军事上已经尽了最大努力，湘江的损失，责任不能完全由中央来负。' }
              ] },
            { id: 'lide', name: '李德', role: '共产国际军事顾问', stance: '必须执行原定方案',
              lines: [
                { speaker: '李德', role: '共产国际军事顾问',
                  text: '我们的战术没有错，是敌人的飞机大炮太多！必须执行原定方案——继续北上湘西，与红二、六军团会合。' }
              ] },
            { id: 'zhou', name: '周恩来', role: '中央政治局常委 · 红军总政委', stance: '主动承担指挥责任',
              lines: [
                { speaker: '周恩来', role: '中央政治局常委 · 红军总政委',
                  text: '我作为红军总政委，对军事指挥上的失误负有责任。作战方针确实存在问题，这一点我必须讲清楚。' }
              ] },
            { id: 'mao', name: '毛泽东', role: '中央政治局委员', stance: '改向贵州，打运动战',
              lines: [
                { speaker: '毛泽东', role: '中央政治局委员',
                  text: '第五次反“围剿”，我们放弃了行之有效的运动战，去和敌人拼消耗、打阵地战。堡垒对堡垒，以集中对集中——用我们的短处去对敌人的长处，这样打仗，怎么会不失败？' },
                { speaker: '毛泽东', role: '中央政治局委员',
                  text: '（他接着分析）……中国革命战争的规律，是“你打你的，我打我的”。集中优势兵力，各个歼灭敌人，这才是红军的看家本领。指挥错了，就要改！' }
              ] },
            { id: 'zhang', name: '张闻天', role: '中央政治局常委', stance: '赞成改变领导方向',
              lines: [
                { speaker: '张闻天', role: '中央政治局常委',
                  text: '我不同意博古同志的报告。问题的根本，在于军事路线——是“左”倾教条主义那一套，把我们拖到了今天这个地步，必须正视现实！' }
              ] },
            { id: 'wang', name: '王稼祥', role: '红军总政治部主任', stance: '支持毛泽东',
              lines: [
                { speaker: '王稼祥', role: '红军总政治部主任',
                  text: '我支持毛泽东同志的正确军事主张！红军不能再由这样的人指挥下去了，必须马上改变领导！' }
              ] }
          ],
          require: ['bogu', 'mao', 'zhou'],
          climax: [
            { speaker: '旁白', role: '会议决议', narr: true,
              text: '会议开了三天，经过激烈争论，多数同志站到了毛泽东这一边。会议作出决议：①集中全力解决博古等人在军事上和组织上“左”的错误；②肯定毛泽东的正确军事主张；③增选毛泽东为中央政治局常委；④取消博古、李德的军事最高指挥权。' },
            { speaker: '旁白', role: '会后分工', narr: true,
              text: '会后不久，中央常委分工：张闻天负总责；周恩来、毛泽东、王稼祥组成军事指挥小组，负责长征中的军事指挥。' }
          ] },

        { type: 'geo', title: '贵州 — “天无三日晴，地无三里平”', icon: '⛰',
          images: ['assets/photo/zunyi-site-old.webp'],
          content: `
            <h4>地形地貌</h4>
            <p>贵州地处<strong>云贵高原东部</strong>，是全国唯一没有平原支撑的省份。地形以山地、丘陵为主，<strong>喀斯特地貌</strong>广布，地表崎岖破碎，故有“地无三里平”之说。</p>
            <h4>气候特征</h4>
            <ul>
              <li><strong>亚热带湿润季风气候</strong>，年均降水量1200毫米以上</li>
              <li>多云雾、日照少，素有“天无三日晴”之称</li>
              <li>冬无严寒、夏无酷暑，但阴湿多雨</li>
            </ul>
            <h4>为什么选贵州</h4>
            <p>1935年初，国民党在贵州的兵力相对薄弱，且黔军战斗力不强。毛泽东建议向贵州推进，正是看准了这一军事与地理格局——<strong>往敌人力量薄弱的地方去</strong>，为红军赢得了喘息和整合的机会。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【遵义会议】，找到这座改变中国命运的小楼', highlight: 'zunyi' },

        { type: 'quiz',
          question: '遵义会议的核心内容不包括以下哪一项？',
          options: [
            { label: 'A', text: '集中解决博古等人在军事和组织上的“左”倾错误', correct: false },
            { label: 'B', text: '增选毛泽东为中央政治局常委', correct: false },
            { label: 'C', text: '宣布中华苏维埃共和国正式成立', correct: true },
            { label: 'D', text: '取消博古、李德的军事最高指挥权', correct: false }
          ],
          explanation: '中华苏维埃共和国临时中央政府早在1931年11月就已在江西瑞金成立，与遵义会议无关。' },

        { type: 'quiz',
          question: '为什么说遵义会议是中国共产党历史上“生死攸关的转折点”？',
          options: [
            { label: 'A', text: '遵义会议使红军人数大幅增加', correct: false },
            { label: 'B', text: '开始确立毛泽东的领导地位，使党和红军转危为安，走向胜利', correct: true },
            { label: 'C', text: '遵义会议宣告国民党“围剿”彻底失败', correct: false },
            { label: 'D', text: '遵义会议确定了农村包围城市的战略方针', correct: false }
          ],
          explanation: '遵义会议纠正了“左”倾错误，开始确立以毛泽东为主要代表的马克思主义正确路线在党中央的领导地位，是党从幼年走向成熟的标志。此后红军四渡赤水、巧渡金沙江，从被动变为主动。' }
      ]
    },

    /* ══════════════════════════════════════════════════════
       第四幕：四渡赤水 · 巧渡金沙江
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch4',
      title: '四渡赤水 · 巧渡金沙江',
      subtitle: '1935年1月—5月 · 川黔滇边境',
      mapFocus: 'chishui',
      steps: [

        { type: 'narrate', bg: 'mountain_river',
          text: '遵义会议后，毛泽东重新回到军事指挥的核心。红军的打法，完全变了。' },

        { type: 'dialog', bg: 'mountain_river', speaker: '毛泽东', role: '军事指挥',
          charLeft: 'mao',
          text: '敌人兵力多，我们就和他兜圈子。打得赢就打，打不赢就走——兵者，诡道也。' },

        { type: 'narrate', bg: 'mountain_river',
          text: '1935年1月至3月，红军在川黔滇边界的赤水河两岸四次往返：一渡赤水，西进扎西；二渡赤水，回师遵义，歼敌两个师又八个团，取得长征以来最大的一次胜利；三渡赤水，再入川南；四渡赤水，南渡乌江，兵锋直逼贵阳。' },

        { type: 'narrate', bg: 'mountain_river',
          text: '蒋介石正在贵阳督战，红军兵临城下，他急调滇军前来“救驾”。红军却虚晃一枪，掉头西进，直插云南——把几十万敌军远远甩在了身后。' },

        { type: 'narrate', bg: 'golden_river',
          text: '1935年4月底，红军兵临金沙江。在全军必经的禄劝皎平渡，红军只找到7只木船。就靠这7只小船，昼夜不停，用了9天9夜，把全军渡过了金沙江。' },

        { type: 'dialog', bg: 'golden_river', speaker: '周恩来', role: '军事指挥小组成员',
          charLeft: 'zhou',
          text: '渡江完成。敌人追到江边时，我们已经是最后一批了——金沙江成了他们的终点，也成了我们的起点。' },

        { type: 'narrate', bg: 'golden_river',
          text: '这一渡，让红军彻底跳出了几十万敌军的重重包围，实现了战略转移中具有决定意义的胜利。' },

        { type: 'geo', title: '金沙江 — 长江上游的天险', icon: '🌊',
          images: ['assets/event/jinsha-river.webp'],
          content: `
            <h4>地理概况</h4>
            <p>金沙江是<strong>长江上游的干流</strong>，从青藏高原奔流而下，在云南境内形成深切峡谷，江面宽约 200—400 米，两岸高山耸立，是著名的天然屏障。</p>
            <h4>地形特征</h4>
            <ul>
              <li>地处<strong>横断山脉</strong>，山高谷深，地势险峻</li>
              <li>江水流经含铁质岩层，水色泛金，故名“金沙江”</li>
              <li>两岸多为悬崖峭壁，渡口稀少，历来是滇川之间的天堑</li>
            </ul>
            <h4>军事意义</h4>
            <p>红军渡过金沙江后，国民党追兵被阻隔在江南岸。<strong>跳出了敌人的重重包围</strong>，红军由被动转为主动。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【巧渡金沙江】，看看皎平渡在哪里', highlight: 'jinshajiang' },

        { type: 'quiz',
          question: '红军“四渡赤水”的战略目的是什么？',
          options: [
            { label: 'A', text: '强渡湘江，向北转移', correct: false },
            { label: 'B', text: '声东击西，打乱敌人“追剿”计划，寻机北渡长江', correct: true },
            { label: 'C', text: '直接进攻贵阳，歼灭国民党主力', correct: false },
            { label: 'D', text: '与红二、六军团会合', correct: false }
          ],
          explanation: '四渡赤水是毛泽东灵活用兵的经典之作：通过忽东忽西的机动，把敌人拖得晕头转向，打乱了“追剿”计划，为巧渡金沙江、北上创造了条件。' },

        { type: 'quiz',
          question: '红军在皎平渡仅靠 7 只小船渡过金沙江，其最重要的意义是？',
          options: [
            { label: 'A', text: '打乱了敌人的“追剿”计划', correct: false },
            { label: 'B', text: '跳出了几十万敌军的重重包围', correct: true },
            { label: 'C', text: '宣告红军长征胜利结束', correct: false },
            { label: 'D', text: '确立了毛泽东在党中央的领导地位', correct: false }
          ],
          explanation: '四渡赤水打乱了敌人的“追剿”计划；巧渡金沙江则使红军彻底跳出了敌人的重重包围。长征胜利结束是 1936 年 10 月会宁会师。' }
      ]
    },

    /* ══════════════════════════════════════════════════════
       第五幕：强渡大渡河 · 飞夺泸定桥（跨学科重点）
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch5',
      title: '强渡大渡河 · 飞夺泸定桥',
      subtitle: '1935年5月 · 四川安顺场 → 泸定桥',
      mapFocus: 'luding',
      is3D: true,
      scene3D: 'luding_bridge',
      steps: [

        { type: 'narrate', bg: 'sichuan_mountain',
          text: '1935年5月，红军来到四川石棉县安顺场。横在面前的，是大渡河。' },

        { type: 'narrate', bg: 'sichuan_mountain',
          text: '大渡河发源于青海，自北向南奔腾而下，两岸是壁立的悬崖。72年前，太平天国将领石达开率数万大军，就是在这条河边全军覆没。' },

        { type: 'dialog', bg: 'sichuan_mountain', speaker: '蒋介石', role: '国民党政府军事委员会委员长',
          charRight: 'chiang',
          text: '大渡河就是红军的葬身之地。传令下去：一定要让红军做“石达开第二”！' },

        // ── 地理知识 1：峡谷剖面
        { type: 'geo', title: '大渡河为什么被称为“天险”？', icon: '🌏',
          images: ['assets/geo/valley.webp'],
          content: `
            <h4>地形：横断山区，高山深谷</h4>
            <ul>
              <li>大渡河位于<strong>横断山区</strong>，两岸高山夹峙，河谷深切</li>
              <li>从山顶到河面落差近 <strong>3000 米</strong>，河水奔腾湍急</li>
            </ul>
            <h4>水文：落差大 + 融雪补给</h4>
            <ul>
              <li>5 月气温回升，<strong>高山融雪补给</strong>，水量增大、流速更快</li>
              <li>峡谷束缚河道，谷窄流急——<strong>架桥、行船都极难</strong></li>
            </ul>
            <h4>结论</h4>
            <p>正因为“水急谷窄”，红军在安顺场<strong>无法架设浮桥</strong>，只能靠渡船或夺取现成的桥梁。</p>
          ` },

        { type: 'narrate', bg: 'sichuan_mountain',
          text: '安顺场渡口，红军只找到几条小船。几万人靠这几条船渡河，要整整一个月。' },

        { type: 'dialog', bg: 'sichuan_mountain', speaker: '周恩来', role: '军事指挥小组成员',
          charLeft: 'zhou',
          text: '追兵三天之内就会赶到。我们没有一个月。' },

        { type: 'dialog', bg: 'sichuan_mountain', speaker: '毛泽东', role: '军事指挥小组成员',
          charLeft: 'mao',
          text: '上游还有一座桥——泸定桥。那是大渡河上唯一的桥。桥在，路就在。' },

        // ── 地理知识 2：位置关系
        { type: 'geo', title: '安顺场，还是泸定桥？', icon: '🌏',
          images: ['assets/geo/position.webp'],
          content: `
            <h4>两条路，两种命运</h4>
            <ul>
              <li><strong>安顺场</strong>：渡口小、船极少，水急无法架浮桥，几万人渡不完</li>
              <li><strong>泸定桥</strong>：大渡河上唯一可通行的桥梁，在上游约 <strong>240 里</strong></li>
            </ul>
            <h4>地理视角的判断</h4>
            <p>大渡河自北向南流，两岸高山峡谷，<strong>渡口少、水流急</strong>。在这种地形条件下，桥梁是唯一能够快速通过大部队的通道——<strong>桥能过人，船渡不了大军</strong>。</p>
            <h4>距离概念</h4>
            <p>240 里 ≈ 120 公里，而且是在崎岖的峡谷山路上。红军必须在一昼夜内赶到，才能抢在敌人增援之前夺桥。</p>
          ` },

        { type: 'narrate', bg: 'sichuan_mountain',
          text: '红四团接到命令：一昼夜奔袭 240 里，抢在敌人增援之前拿下泸定桥。这是崎岖的峡谷山路，一边是悬崖，一边是激流，红军翻山越岭、冒雨疾行。' },

        { type: 'narrate', bg: 'luding_bridge_bg',
          text: '1935年5月29日清晨，红四团赶到了泸定桥。桥上的木板，已经被守军全部抽走——只剩下 13 根铁索，横在湍急的江面之上。' },

        /* ── 三维现场：飞夺泸定桥 ── */
        { type: 'scene3d', sceneName: 'luding_bridge',
          label: '飞夺泸定桥 · 1935年5月29日',
          caption: '22 名勇士攀着 13 根铁索，在枪林弹雨中夺下泸定桥',
          enterText: '红四团一昼夜奔袭 240 里，抢在敌人增援之前赶到了泸定桥。桥上的木板已经被守军全部抽走——只剩下 13 根铁索，横在湍急的江面之上。',
          freeText: '自由环视：拖动鼠标环视峡谷与铁索，滚轮可以推近拉远。看够了，点右下角的【继续】，听本场讲解。',
          intro: [
            { speaker: '旁白', role: '大渡河 · 泸定桥', narr: true,
              text: '大渡河水流湍急、两岸绝壁，太平天国名将石达开就是在这里全军覆没的。蒋介石扬言：要让红军做“石达开第二”。' }
          ],
          climax: [
            { speaker: '突击队长', role: '红四团',
              text: '同志们！桥板没了，铁索还在！22 名突击队员，跟我上——攀着铁索，爬也要爬过去！' },
            { speaker: '旁白', role: '泸定桥 · 1935.5.29', narr: true,
              text: '22 名勇士，每人一支短枪、一把马刀、几颗手榴弹，攀上摇晃的铁索。对岸火光冲天，子弹打在铁索上溅起火星，他们一个接一个，向对岸爬去。' },
            { speaker: '旁白', role: '泸定桥 · 1935.5.29', narr: true,
              text: '“同志们，冲呀！”红军夺下了泸定桥，主力顺利渡过大渡河。蒋介石让红军做“石达开第二”的妄想，彻底破产了。' }
          ] },

        // ── 地理知识 3：铁索桥结构
        { type: 'geo', title: '泸定桥：13 根铁索上的通路', icon: '🌏',
          images: ['assets/geo/bridge.webp'],
          content: `
            <h4>基本信息</h4>
            <ul>
              <li>位于四川甘孜<strong>泸定县</strong>，横跨大渡河，桥面海拔约 1330 米</li>
              <li>清康熙四十五年（<strong>1706 年</strong>）建成，康熙赐名“泸定”</li>
              <li>全长约 <strong>103 米</strong>，宽约 3 米</li>
            </ul>
            <h4>结构</h4>
            <ul>
              <li>由 <strong>13 根铁索</strong>组成：<strong>9 根作桥面</strong>，<strong>4 根作扶手</strong></li>
              <li>桥面上原本铺有木板，守军撤退时全部抽走</li>
            </ul>
            <h4>地理意义</h4>
            <p>泸定桥地处<strong>四川盆地向青藏高原的过渡地带</strong>，是川藏茶马古道上的要津，也是大渡河上唯一可通行大部队的桥梁。</p>
          ` },

        // ── 语文知识卡
        { type: 'geo', title: '诗句里的山河（语文）', icon: '📖',
          images: [],
          content: `
            <p class="quote">红军不怕远征难，万水千山只等闲。<br>
            五岭逶迤腾细浪，乌蒙磅礴走泥丸。<br>
            金沙水拍云崖暖，<strong>大渡桥横铁索寒</strong>。<br>
            更喜岷山千里雪，三军过后尽开颜。</p>
            <p class="quote-src">—— 毛泽东《七律·长征》，写于 1935 年 10 月</p>
            <h4>逐句读地理</h4>
            <ul>
              <li><strong>“五岭逶迤”</strong>：五岭是长江与珠江水系的分水岭，横亘湘赣粤。</li>
              <li><strong>“乌蒙磅礴”</strong>：乌蒙山在云贵高原，山势磅礴。</li>
              <li><strong>“金沙水拍云崖暖”</strong>：写巧渡金沙江——两岸悬崖入云，江水拍岸，一个“暖”字写出渡江后的舒展。</li>
              <li><strong>“大渡桥横铁索寒”</strong>：写飞夺泸定桥——13 根铁索横在激流之上，一个“寒”字，既是水寒、铁寒，也是那一仗的凶险。</li>
            </ul>
            <p>两句七言，把巧渡金沙江和飞夺泸定桥都写了进去——<strong>这是历史，也是文学</strong>。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【飞夺泸定桥】，看看大渡河上的这座桥', highlight: 'luding' },

        { type: 'quiz',
          question: '红军没有在安顺场架设浮桥，而是北上夺取泸定桥。从地理角度看，最主要的原因是？',
          options: [
            { label: 'A', text: '大渡河落差大、水流湍急，无法架设浮桥，而渡船又太少', correct: true },
            { label: 'B', text: '安顺场河道太宽，找不到足够长的架桥材料', correct: false },
            { label: 'C', text: '安顺场两岸没有村庄，缺少会架桥的工匠', correct: false },
            { label: 'D', text: '国民党军已经炸毁了安顺场附近的所有船只', correct: false }
          ],
          explanation: '横断山区高山深谷、落差近 3000 米，5 月又有融雪补给，水急谷窄，浮桥架不住；安顺场只有几条小船，渡不完几万大军。所以唯一的办法是夺取上游的泸定桥。' },

        { type: 'quiz',
          question: '泸定桥由 13 根铁索组成，它们的分布是？',
          options: [
            { label: 'A', text: '13 根全部作桥面', correct: false },
            { label: 'B', text: '9 根作桥面，4 根作扶手', correct: true },
            { label: 'C', text: '7 根作桥面，6 根作扶手', correct: false },
            { label: 'D', text: '4 根作桥面，9 根作扶手', correct: false }
          ],
          explanation: '泸定桥全长约 103 米，由 13 根铁索组成，其中 9 根铺作桥面、4 根分列两侧作扶手。红军夺桥时，桥面木板已被守军全部抽走。' },

        { type: 'quiz',
          question: '毛泽东《七律·长征》中“大渡桥横铁索寒”一句，描写的是哪一次战斗？',
          options: [
            { label: 'A', text: '强渡大渡河', correct: false },
            { label: 'B', text: '飞夺泸定桥', correct: true },
            { label: 'C', text: '巧渡金沙江', correct: false },
            { label: 'D', text: '四渡赤水', correct: false }
          ],
          explanation: '“铁索”正是泸定桥的特征——13 根铁索，22 名勇士攀索夺桥，所以这句写的是飞夺泸定桥。' }
      ]
    },

    /* ══════════════════════════════════════════════════════
       第六幕：爬雪山 · 过草地
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch6',
      title: '爬雪山 · 过草地',
      subtitle: '1935年6月—8月 · 川西高原',
      mapFocus: 'xueshancaodi',
      is3D: true,
      scene3D: 'snow_mountain',
      steps: [

        { type: 'narrate', bg: 'snow_mountain_bg',
          text: '飞夺泸定桥后，红军继续北上。前方是终年积雪的夹金山——红军将要翻越的第一座大雪山，海拔 4000 米以上，山顶终年积雪，空气稀薄，气候瞬息万变。' },

        /* ── 三维现场：翻越夹金山 ── */
        { type: 'scene3d', sceneName: 'snow_mountain',
          label: '翻越夹金山 · 海拔 4114 米',
          caption: '红军穿着单衣草鞋，在高寒缺氧中翻越雪山',
          enterText: '夹金山是红军长征中翻越的第一座大雪山，海拔 4114 米，山顶终年积雪，空气稀薄，气候瞬息万变。红军穿着单衣草鞋，走进了这片“生命禁区”。',
          freeText: '自由环视：拖动鼠标看看连绵的雪峰和风雪中的行军队伍，滚轮可以推近拉远。看够了，点右下角的【继续】。',
          intro: [
            { speaker: '旁白', role: '夹金山 · 1935年6月', narr: true,
              text: '越往上走，空气越稀薄，风越大，气温越低。当地百姓说：夹金山是神山，上去的人回不来。红军却要翻过去。' }
          ],
          climax: [
            { speaker: '老战士', role: '长征亲历者',
              text: '山上冰天雪地，风刮得像刀子。我们穿着单衣草鞋，有人走着走着就倒下了，再也没有起来……可队伍没有停，一直往上走。' },
            { speaker: '旁白', role: '夹金山 · 1935年6月', narr: true,
              text: '翻过雪山，红军进入川西北的松潘草地。这片辽阔的高原沼泽，表面是青草，下面是泥潭，一脚踩空就可能陷进去；气候变化无常，没有人烟，更没有粮食。' },
            { speaker: '旁白', role: '松潘草地 · 1935年8月', narr: true,
              text: '野菜、草根、皮带、皮鞋……能吃的都吃了。后来收藏在中国国家博物馆的“半截皮带”，就来自这片草地。许多战士陷进泥沼，再也没能出来。' }
          ] },

        { type: 'dialog', bg: 'grassland_bg', speaker: '周恩来', role: '军事指挥小组成员',
          charLeft: 'zhou',
          text: '“无论如何都要跟着党走下去。只要坚持，肯定会有胜利的一天。”' },

        { type: 'dialog', bg: 'grassland_bg', speaker: '毛泽东', role: '长征诗词',
          charRight: 'mao',
          text: '“更喜岷山千里雪，三军过后尽开颜。”——无论多大的艰难险阻，都挡不住我们革命的脚步！' },

        { type: 'geo', title: '青藏高原东缘 — 雪山与草地', icon: '🏔',
          images: ['assets/event/snow-mountain.webp', 'assets/event/grassland.webp'],
          content: `
            <h4>地形地貌</h4>
            <p>红军翻越的雪山位于<strong>青藏高原东缘</strong>，山脉属横断山系，主峰海拔多在 4000—5000 米，终年积雪，被称为“生命禁区”。</p>
            <h4>松潘草地（若尔盖湿地）</h4>
            <ul>
              <li>若尔盖高原湿地面积约 3 万平方千米，平均海拔 3400—3600 米</li>
              <li>属<strong>高寒沼泽草甸</strong>，表面看起来是草地，实则沼泽密布</li>
              <li>夏季多雷雨、气温骤降，缺少食物和燃料</li>
            </ul>
            <h4>高原气候</h4>
            <p>高原气候的三大特点：<strong>气温低、气压低、氧气稀薄</strong>，风速大。从河谷到山顶，气候垂直差异显著，这就是<strong>山地垂直气候带</strong>。</p>
            <h4>生态价值</h4>
            <p>若尔盖湿地是<strong>黄河的重要水源补给区</strong>，涵养着大量淡水资源，是中国重要的生态屏障。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【雪山草地】，看看这段最艰难的路程', highlight: 'xueshancaodi' },

        { type: 'quiz',
          question: '红军翻越雪山、穿越草地时面临的主要自然挑战不包括？',
          options: [
            { label: 'A', text: '高寒缺氧，气温极低', correct: false },
            { label: 'B', text: '草地沼泽遍布，随时可能陷入泥潭', correct: false },
            { label: 'C', text: '热带雨林气候，蚊虫肆虐', correct: true },
            { label: 'D', text: '粮食断绝，以野菜、皮带充饥', correct: false }
          ],
          explanation: '雪山和草地均位于青藏高原东缘，属高原气候，气温低、氧气稀薄，与热带雨林气候完全相反。红军面对的是严寒、缺氧、沼泽、断粮，而不是热带环境。' },

        { type: 'quiz',
          question: '“半截皮带”的故事发生在长征的哪一段路程？',
          options: [
            { label: 'A', text: '血战湘江途中', correct: false },
            { label: 'B', text: '过草地途中', correct: true },
            { label: 'C', text: '飞夺泸定桥途中', correct: false },
            { label: 'D', text: '会宁会师之后', correct: false }
          ],
          explanation: '过草地时粮食断绝，战士们把皮带煮软充饥，“半截皮带”如今收藏在中国国家博物馆，是长征艰苦卓绝的见证。' }
      ]
    },

    /* ══════════════════════════════════════════════════════
       第七幕：长征胜利 · 三军会师
    ══════════════════════════════════════════════════════ */
    {
      id: 'ch7',
      title: '长征胜利 · 三军会师',
      subtitle: '1935年9月—1936年10月 · 陕甘宁',
      mapFocus: 'huining',
      steps: [

        { type: 'narrate', bg: 'loess_plateau',
          text: '1935年9月，红军突破甘南天险腊子口。这道隘口两侧峭壁高达数百米，宽仅 30 余米，只有一条小路通过。红军正面强攻、侧后攀崖奇袭，一举突破，打开了进入陕甘的大门。' },

        { type: 'narrate', bg: 'loess_plateau',
          text: '越过岷山，翻过六盘山，1935年10月，中央红军到达陕北吴起镇，与陕北红军会师。历时一年、行程二万五千里的长征，取得重大胜利。' },

        { type: 'dialog', bg: 'loess_plateau', speaker: '毛泽东', role: '1935年10月 · 吴起镇',
          charLeft: 'mao',
          text: '我们完成了长征！长征是历史纪录上的第一次。长征是宣言书，长征是宣传队，长征是播种机！它向全世界宣告，红军是英雄好汉。' },

        { type: 'narrate', bg: 'huining_bg',
          text: '1936年10月，红一、红二、红四方面军三大主力在甘肃会宁、将台堡胜利会师。中国工农红军长征宣告胜利结束，中国革命转危为安。' },

        { type: 'geo', title: '陕北黄土高原 — 新的革命根据地', icon: '🏜',
          images: ['assets/photo/loess.webp'],
          content: `
            <h4>地形特征</h4>
            <p>黄土高原位于中国中部，是世界上<strong>最大的黄土沉积区</strong>。地表支离破碎、千沟万壑，以<strong>塬、梁、峁</strong>等地貌为主。</p>
            <h4>气候条件</h4>
            <ul>
              <li><strong>温带大陆性气候</strong>，干旱少雨，年降水量 300—600 毫米</li>
              <li>冬冷夏热，昼夜温差大</li>
              <li>土质疏松、暴雨集中，<strong>水土流失严重</strong>，是黄河泥沙的主要来源</li>
            </ul>
            <h4>战略价值</h4>
            <p>陕北地处黄土高原腹地，地形复杂、易守难攻，<strong>成为红军长征后建立根据地的理想之地</strong>。延安后来成为中国共产党的指挥中心。</p>
          ` },

        { type: 'map', instruction: '点击地图上的【会宁会师】，找到长征胜利结束的地方', highlight: 'huining' },

        { type: 'quiz',
          question: '1936年10月，红军三大主力会师的地点是？',
          options: [
            { label: 'A', text: '陕西吴起镇', correct: false },
            { label: 'B', text: '甘肃会宁', correct: true },
            { label: 'C', text: '陕西延安', correct: false },
            { label: 'D', text: '宁夏固原', correct: false }
          ],
          explanation: '1936年10月三大主力在甘肃会宁、将台堡会师，长征结束。1935年10月中央红军到达陕北吴起镇，是长征的重大胜利，但三军会师在会宁。' },

        { type: 'quiz',
          question: '长征胜利的历史意义，下列说法不正确的是？',
          options: [
            { label: 'A', text: '粉碎了国民党反动派消灭红军的企图', correct: false },
            { label: 'B', text: '保存了党和红军的基干力量', correct: false },
            { label: 'C', text: '播下了革命的种子，铸就了长征精神', correct: false },
            { label: 'D', text: '长征使国民党政府宣告覆灭', correct: true }
          ],
          explanation: '国民党政府直到 1949 年才覆灭，与长征没有直接关系。长征的意义在于：粉碎了敌人消灭红军的企图，保存了党和红军的基干力量，使中国革命转危为安，播撒了革命火种，铸就了长征精神。' },

        { type: 'narrate', bg: 'victory_bg',
          text: '长征，这段跨越 11 个省份、行程二万五千里的伟大征程，是人类战争史上前所未有的壮举。' },

        { type: 'narrate', bg: 'victory_bg',
          text: '1955 年中国人民解放军首次授衔的将帅中，中将以上共 254 人，其中有 222 人参加过长征。单衣爬雪山，绝粮过草地——支撑着红军一直向前的，是革命信仰。' },

        { type: 'narrate', bg: 'victory_bg',
          text: '“每一代人有每一代人的长征路，每一代人都要走好自己的长征路。”今天，我们这一代人的长征，就是实现中华民族伟大复兴的中国梦。' }
      ]
    }

  ]
};
