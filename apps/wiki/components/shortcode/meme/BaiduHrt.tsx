export default function BaiduHrt() {
  return (
    <div className="text-xs border-collapse rounded-xl border-0 mx-4 py-3 px-4 w-auto shadow-md">
      <div className="mb-px">
        <a
          href="https://fanyi.baidu.com/#en/zh/hormone%20replacement%20therapy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg text-blue-700 inline-block underline"
        >
          <em className="not-italic text-red-600 underline">
            hormone replacement therapy
          </em>{' '}
          - 百度翻译
        </a>
        <div>
          <span className="text-2xl h-6 leading-6 mr-4">
            hormone replacement therapy
          </span>
          <br />
          <span className="text-sm relative">英</span>
          <span className="mr-3">[ˌhɔːməʊn rɪˈpleɪsmənt θerəpi]</span>
          <br />
          <span className="text-sm relative">美</span>
          <span className="mr-3">[ˌhɔːrmoʊn rɪˈpleɪsmənt θerəpi]</span>
        </div>
        <div>
          <span className="float-left min-w-10 whitespace-nowrap text-gray-500">
            n.
          </span>
          <div className="ml-10">
            <span>激素替代治疗(缩略形式为HRT)</span>
          </div>
        </div>
        <div>
          <span className="float-left min-w-10 whitespace-nowrap">[例句]</span>
          <div className="ml-10">
            <span>
              <em className="text-red-700">Hormone replacement therapy</em> is
              very important and should be instituted early.
            </span>
            <div>激素替代治疗非常重要，应该及早开始。</div>
          </div>
        </div>
        <div className="mt-2 flex justify-between">
          <p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://store.steampowered.com/app/1345740"
            >
              <del>进行更多翻译</del>
            </a>
          </p>
          <div className="text-gray-600 flex items-center cursor-pointer group">
            <div
              className="w-3.5 h-3.5 bg-center bg-cover mr-1 relative"
              style={{
                backgroundImage:
                  'url("/hugo-static/images/meme/baidu-hrt.png")',
              }}
            >
              <div
                className="hidden group-hover:block w-23 h-23 rounded-md bg-white absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 shadow-md bg-center bg-no-repeat"
                style={{
                  backgroundImage:
                    'url("/hugo-static/images/meme/baidu-hrt.png")',
                  backgroundSize: '80px',
                }}
              />
            </div>
            <a
              href="https://store.steampowered.com/app/1345740"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 no-underline group-hover:text-blue-600"
            >
              <del>扫码下载百度翻译APP</del>
            </a>
          </div>
        </div>
      </div>
      <p className="text-center line-through">百度说要早点 HRT</p>
    </div>
  );
}
