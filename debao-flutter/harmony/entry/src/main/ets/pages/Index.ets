import { webview } from '@kit.ArkWeb';

@Entry
@Component
struct Index {
  controller: webview.WebviewController = new webview.WebviewController();

  build() {
    Column() {
      Web({ src: 'http://127.0.0.1:8097/?embedded=1', controller: this.controller })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .mixedMode(MixedMode.All)
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
  }
}
