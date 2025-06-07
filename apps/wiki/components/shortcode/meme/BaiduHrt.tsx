import styles from '../css/BaiduHrt.module.css';

export default function BaiduHrt() {
  return (
    <div className={styles.baiduHrt}>
      <div className={styles.opDictContent}>
        <a 
          href="https://fanyi.baidu.com/#en/zh/hormone%20replacement%20therapy" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.searchBd}
        >
          <em>hormone replacement therapy</em> - 百度翻译
        </a>
        <div>
          <span className={`${styles.opDict3Font24} ${styles.opDict3MarginRight}`}>hormone replacement therapy</span><br />
          <span className={styles.opDict3Font14}>英</span>
          <span className={styles.symbols}>[ˌhɔːməʊn rɪˈpleɪsmənt θerəpi]</span><br />
          <span className={styles.opDict3Font14}>美</span>
          <span className={styles.symbols}>[ˌhɔːrmoʊn rɪˈpleɪsmənt θerəpi]</span>
        </div>
        <div>
          <span className={`${styles.opDictText1} ${styles.opDict3Gray}`}>n.</span>
          <div className={styles.opDictResult}>
            <span>激素替代治疗(缩略形式为HRT)</span>
          </div>
        </div>
        <div>
          <span className={styles.opDictText1}>[例句]</span>
          <div className={styles.opDictResult}>
            <span>
              <em className={styles.opDict3Highlight}>Hormone replacement therapy</em> is very important and should be instituted early.
            </span>
            <div>激素替代治疗非常重要，应该及早开始。</div>
          </div>
        </div>
        <div className={styles.opGuideCont}>
          <p className={styles.opDict3Exectrans}>
            <a target="_blank" rel="noopener noreferrer" href="https://store.steampowered.com/app/1345740">
              <del>进行更多翻译</del>
            </a>
          </p>
          <div className={styles.opGuide}>
            <div className={styles.opQrMini}>
              <div className={styles.opQr} />
            </div>
            <a href="https://store.steampowered.com/app/1345740" target="_blank" rel="noopener noreferrer">
              <del>扫码下载百度翻译APP</del>
            </a>
          </div>
        </div>
      </div>
      <p className={styles.baiduSay}>百度说要早点 HRT</p>
    </div>
  );
} 