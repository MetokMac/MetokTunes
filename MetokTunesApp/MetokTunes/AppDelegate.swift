import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set up main window
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // Set up root view controller
        let webViewVC = ViewController()
        let navigationController = UINavigationController(rootViewController: webViewVC)
        
        // Configure navigation bar
        navigationController.navigationBar.barStyle = .black
        navigationController.navigationBar.tintColor = .white
        
        // Set as root view controller
        window?.rootViewController = navigationController
        window?.makeKeyAndVisible()
        
        return true
    }
}
