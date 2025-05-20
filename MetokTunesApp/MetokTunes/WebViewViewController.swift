import UIKit
import WebKit

class WebViewViewController: UIViewController, WKNavigationDelegate {
    var webView: WKWebView!
    
    override func loadView() {
        webView = WKWebView()
        webView.navigationDelegate = self
        view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Load the web app
        if let url = URL(string: "https://metoktunes.web.app") {
            let request = URLRequest(url: url)
            webView.load(request)
        }
        
        // Configure WKWebView settings
        webView.configuration.websiteDataStore.httpCookieStore.getAllCookies { cookies in
            // Handle cookies if needed
        }
        
        // Add pull-to-refresh
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(refreshWebView), for: .valueChanged)
        webView.scrollView.addSubview(refreshControl)
    }
    
    @objc func refreshWebView() {
        webView.reload()
    }
    
    // Handle navigation
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = navigationAction.request.url {
            // Handle external links
            if url.host != "metoktunes.web.app" {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
        }
        decisionHandler(.allow)
    }
    
    // Handle errors
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("Error loading web content: \(error.localizedDescription)")
    }
}
