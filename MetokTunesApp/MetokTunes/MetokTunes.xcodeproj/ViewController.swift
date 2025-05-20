import UIKit
import WebKit
import UserNotifications

class ViewController: UIViewController, WKNavigationDelegate, UITabBarDelegate, UNUserNotificationCenterDelegate, UITableViewDelegate, UITableViewDataSource {
    var webView: WKWebView!
    var activityIndicator: UIActivityIndicatorView!
    var refreshControl: UIRefreshControl!
    var navigationBar: UINavigationBar!
    var bottomBar: UITabBar!
    var notificationCenter: UNUserNotificationCenter!
    var musicPlayerView: UIView!
    var musicControlsStack: UIStackView!
    var songTitleLabel: UILabel!
    var artistNameLabel: UILabel!
    var playPauseButton: UIButton!
    var nextButton: UIButton!
    var previousButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Request notification permissions
        notificationCenter = UNUserNotificationCenter.current()
        notificationCenter.delegate = self
        requestNotificationPermissions()
        
        // Configure WKWebView
        let webConfiguration = WKWebViewConfiguration()
        
        // Setup music player
        setupMusicPlayer()
        
        // Configure WKWebView
        let webConfiguration = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.navigationDelegate = self
        
        // Setup navigation bar
        setupNavigationBar()
        
        // Setup bottom tab bar
        setupBottomBar()
        
        // Add pull-to-refresh
        refreshControl = UIRefreshControl()
        refreshControl.addTarget(self, action: #selector(refreshWebView), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl
        
        // Add web view to view
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: navigationBar.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: bottomBar.topAnchor)
        ])
        
        // Load local web app
        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        
        // Add activity indicator
        activityIndicator = UIActivityIndicatorView(style: .large)
        activityIndicator.color = .systemGreen
        activityIndicator.hidesWhenStopped = true
        view.addSubview(activityIndicator)
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    
    func setupNavigationBar() {
        navigationBar = UINavigationBar()
        navigationBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(navigationBar)
        
        NSLayoutConstraint.activate([
            navigationBar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            navigationBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            navigationBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            navigationBar.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        let navItem = UINavigationItem(title: "MetokTunes")
        let searchButton = UIBarButtonItem(barButtonSystemItem: .search, target: self, action: #selector(searchTapped))
        let notificationsButton = UIBarButtonItem(barButtonSystemItem: .bookmarks, target: self, action: #selector(showNotifications))
        navItem.rightBarButtonItem = searchButton
        navItem.leftBarButtonItem = notificationsButton
        
        navigationBar.setItems([navItem], animated: false)
    }
    
    func setupBottomBar() {
        bottomBar = UITabBar()
        bottomBar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bottomBar)
        
        NSLayoutConstraint.activate([
            bottomBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            bottomBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            bottomBar.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            bottomBar.heightAnchor.constraint(equalToConstant: 49)
        ])
        
        let homeItem = UITabBarItem(title: "Home", image: UIImage(systemName: "house.fill"), tag: 0)
        let radioItem = UITabBarItem(title: "Radio", image: UIImage(systemName: "radio.fill"), tag: 1)
        let playlistsItem = UITabBarItem(title: "Playlists", image: UIImage(systemName: "list.bullet"), tag: 2)
        let discoverItem = UITabBarItem(title: "Discover", image: UIImage(systemName: "magnifyingglass"), tag: 3)
        let profileItem = UITabBarItem(title: "Profile", image: UIImage(systemName: "person.fill"), tag: 4)
        
        bottomBar.items = [homeItem, radioItem, playlistsItem, discoverItem, profileItem]
        bottomBar.selectedItem = homeItem
            bottomBar.delegate = self
    }
    
    // MARK: - UITabBarDelegate
    
    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        switch item.tag {
        case 0:
            // Home
            webView.loadFileURL(Bundle.main.url(forResource: "index", withExtension: "html")!, allowingReadAccessTo: Bundle.main.bundleURL)
        case 1:
            // Radio
            webView.loadFileURL(Bundle.main.url(forResource: "radio", withExtension: "html")!, allowingReadAccessTo: Bundle.main.bundleURL)
        case 2:
            // Playlists
            webView.loadFileURL(Bundle.main.url(forResource: "playlists", withExtension: "html")!, allowingReadAccessTo: Bundle.main.bundleURL)
        case 3:
            // Discover
            webView.loadFileURL(Bundle.main.url(forResource: "discover", withExtension: "html")!, allowingReadAccessTo: Bundle.main.bundleURL)
        case 4:
            // Profile
            webView.loadFileURL(Bundle.main.url(forResource: "profile", withExtension: "html")!, allowingReadAccessTo: Bundle.main.bundleURL)
        default:
            break
        }
    }
    }
    
    @objc func searchTapped() {
        // Implement search functionality
        let alertController = UIAlertController(title: "Search", message: "Enter search term", preferredStyle: .alert)
        alertController.addTextField { textField in
            textField.placeholder = "Search artists, songs, playlists"
        }
        
        let searchAction = UIAlertAction(title: "Search", style: .default) { [weak self] _ in
            if let text = alertController.textFields?.first?.text {
                // Implement search logic
                print("Searching for: \(text)")
            }
        }
        
        alertController.addAction(searchAction)
        alertController.addAction(UIAlertAction(title: "Cancel", style: .cancel))
        present(alertController, animated: true)
    }
    
    @objc func refreshWebView() {
        webView.reload()
        webView.scrollView.refreshControl?.endRefreshing()
    }
    
    // MARK: - WKNavigationDelegate
    
    func setupMusicPlayer() {
        // Create music player view
        musicPlayerView = UIView()
        musicPlayerView.translatesAutoresizingMaskIntoConstraints = false
        musicPlayerView.backgroundColor = .systemBackground
        view.addSubview(musicPlayerView)
        
        NSLayoutConstraint.activate([
            musicPlayerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            musicPlayerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            musicPlayerView.bottomAnchor.constraint(equalTo: bottomBar.topAnchor),
            musicPlayerView.heightAnchor.constraint(equalToConstant: 150)
        ])
        
        // Create queue button
        let queueButton = UIButton(type: .system)
        queueButton.setImage(UIImage(systemName: "list.bullet"), for: .normal)
        queueButton.addTarget(self, action: #selector(showQueue), for: .touchUpInside)
        musicPlayerView.addSubview(queueButton)
        
        NSLayoutConstraint.activate([
            queueButton.leadingAnchor.constraint(equalTo: musicPlayerView.leadingAnchor, constant: 16),
            queueButton.bottomAnchor.constraint(equalTo: musicPlayerView.bottomAnchor, constant: -8)
        ])
        
        // Create favorite button
        let favoriteButton = UIButton(type: .system)
        favoriteButton.setImage(UIImage(systemName: "heart"), for: .normal)
        favoriteButton.addTarget(self, action: #selector(toggleFavorite), for: .touchUpInside)
        musicPlayerView.addSubview(favoriteButton)
        
        NSLayoutConstraint.activate([
            favoriteButton.trailingAnchor.constraint(equalTo: musicPlayerView.trailingAnchor, constant: -16),
            favoriteButton.bottomAnchor.constraint(equalTo: musicPlayerView.bottomAnchor, constant: -8)
        ])
        
        // Create song title label
        songTitleLabel = UILabel()
        songTitleLabel.translatesAutoresizingMaskIntoConstraints = false
        songTitleLabel.font = .systemFont(ofSize: 16, weight: .semibold)
        songTitleLabel.textColor = .label
        songTitleLabel.text = "Now Playing"
        musicPlayerView.addSubview(songTitleLabel)
        
        // Create artist name label
        artistNameLabel = UILabel()
        artistNameLabel.translatesAutoresizingMaskIntoConstraints = false
        artistNameLabel.font = .systemFont(ofSize: 14)
        artistNameLabel.textColor = .secondaryLabel
        artistNameLabel.text = "Artist Name"
        musicPlayerView.addSubview(artistNameLabel)
        
        // Create progress bar
        let progressView = UIProgressView(progressViewStyle: .default)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        progressView.progressTintColor = .systemGreen
        progressView.trackTintColor = .systemGray6
        musicPlayerView.addSubview(progressView)
        
        // Create volume slider
        let volumeSlider = UISlider()
        volumeSlider.translatesAutoresizingMaskIntoConstraints = false
        volumeSlider.minimumValue = 0
        volumeSlider.maximumValue = 1
        volumeSlider.value = 0.5
        volumeSlider.addTarget(self, action: #selector(volumeChanged), for: .valueChanged)
        musicPlayerView.addSubview(volumeSlider)
        
        // Create music controls stack
        musicControlsStack = UIStackView()
        musicControlsStack.translatesAutoresizingMaskIntoConstraints = false
        musicControlsStack.axis = .horizontal
        musicControlsStack.spacing = 16
        musicControlsStack.distribution = .equalSpacing
        musicPlayerView.addSubview(musicControlsStack)
        
        // Create previous button
        previousButton = UIButton(type: .system)
        previousButton.setImage(UIImage(systemName: "backward.fill"), for: .normal)
        previousButton.addTarget(self, action: #selector(previousSong), for: .touchUpInside)
        
        // Create play/pause button
        playPauseButton = UIButton(type: .system)
        playPauseButton.setImage(UIImage(systemName: "play.fill"), for: .normal)
        playPauseButton.addTarget(self, action: #selector(playPause), for: .touchUpInside)
        
        // Create next button
        nextButton = UIButton(type: .system)
        nextButton.setImage(UIImage(systemName: "forward.fill"), for: .normal)
        nextButton.addTarget(self, action: #selector(nextSong), for: .touchUpInside)
        
        // Create repeat button
        let repeatButton = UIButton(type: .system)
        repeatButton.setImage(UIImage(systemName: "repeat"), for: .normal)
        repeatButton.addTarget(self, action: #selector(toggleRepeat), for: .touchUpInside)
        
        // Create shuffle button
        let shuffleButton = UIButton(type: .system)
        shuffleButton.setImage(UIImage(systemName: "shuffle"), for: .normal)
        shuffleButton.addTarget(self, action: #selector(toggleShuffle), for: .touchUpInside)
        
        // Add controls to stack
        musicControlsStack.addArrangedSubview(previousButton)
        musicControlsStack.addArrangedSubview(playPauseButton)
        musicControlsStack.addArrangedSubview(nextButton)
        musicControlsStack.addArrangedSubview(repeatButton)
        musicControlsStack.addArrangedSubview(shuffleButton)
        
        // Add controls to stack
        musicControlsStack.addArrangedSubview(previousButton)
        musicControlsStack.addArrangedSubview(playPauseButton)
        musicControlsStack.addArrangedSubview(nextButton)
        
        NSLayoutConstraint.activate([
            songTitleLabel.leadingAnchor.constraint(equalTo: musicPlayerView.leadingAnchor, constant: 16),
            songTitleLabel.topAnchor.constraint(equalTo: musicPlayerView.topAnchor, constant: 8),
            
            artistNameLabel.leadingAnchor.constraint(equalTo: songTitleLabel.leadingAnchor),
            artistNameLabel.bottomAnchor.constraint(equalTo: progressView.topAnchor, constant: -8),
            
            progressView.leadingAnchor.constraint(equalTo: musicPlayerView.leadingAnchor, constant: 16),
            progressView.trailingAnchor.constraint(equalTo: musicPlayerView.trailingAnchor, constant: -16),
            progressView.heightAnchor.constraint(equalToConstant: 2),
            progressView.bottomAnchor.constraint(equalTo: volumeSlider.topAnchor, constant: -16),
            
            volumeSlider.leadingAnchor.constraint(equalTo: musicPlayerView.leadingAnchor, constant: 16),
            volumeSlider.trailingAnchor.constraint(equalTo: musicPlayerView.trailingAnchor, constant: -16),
            volumeSlider.bottomAnchor.constraint(equalTo: musicControlsStack.topAnchor, constant: -16),
            
            musicControlsStack.leadingAnchor.constraint(equalTo: musicPlayerView.leadingAnchor, constant: 16),
            musicControlsStack.trailingAnchor.constraint(equalTo: musicPlayerView.trailingAnchor, constant: -16),
            musicControlsStack.bottomAnchor.constraint(equalTo: musicPlayerView.bottomAnchor, constant: -8)
        ])
    }
    
    @objc func volumeChanged(_ sender: UISlider) {
        // Implement volume change logic
        print("Volume changed to: \(sender.value)")
    }
    }
    
    func requestNotificationPermissions() {
        let options: UNAuthorizationOptions = [.alert, .sound, .badge, .provisional]
        notificationCenter.requestAuthorization(options: options) { granted, error in
            if let error = error {
                print("Error requesting notification permissions: \(error.localizedDescription)")
            }
            
            if granted {
                setupNotificationCategories()
            }
        }
    }
    
    func setupNotificationCategories() {
        // Create notification categories
        let likeAction = UNNotificationAction(identifier: "LIKE_ACTION", 
                                            title: "Like",
                                            options: .foreground)
        
        let commentAction = UNNotificationAction(identifier: "COMMENT_ACTION",
                                                title: "Comment",
                                                options: .foreground)
        
        let shareAction = UNNotificationAction(identifier: "SHARE_ACTION",
                                              title: "Share",
                                              options: .foreground)
        
        let newSongCategory = UNNotificationCategory(identifier: "NEW_SONG",
                                                    actions: [likeAction, commentAction, shareAction],
                                                    intentIdentifiers: [],
                                                    options: .customDismissAction)
        
        let playlistCategory = UNNotificationCategory(identifier: "PLAYLIST",
                                                    actions: [likeAction, shareAction],
                                                    intentIdentifiers: [],
                                                    options: .customDismissAction)
        
        notificationCenter.setNotificationCategories([newSongCategory, playlistCategory])
    }
    
    func sendNewSongNotification() {
        let content = UNMutableNotificationContent()
        content.title = "New Song Available"
        content.body = """Your favorite artist has released a new song!"""
        content.categoryIdentifier = "NEW_SONG"
        content.sound = .default
        
        let request = UNNotificationRequest(identifier: UUID().uuidString,
                                          content: content,
                                          trigger: nil)
        
        notificationCenter.add(request)
    }
    
    func sendPlaylistNotification() {
        let content = UNMutableNotificationContent()
        content.title = "New Playlist Created"
        content.body = """Check out our new curated playlist!"""
        content.categoryIdentifier = "PLAYLIST"
        content.sound = .default
        
        let request = UNNotificationRequest(identifier: UUID().uuidString,
                                          content: content,
                                          trigger: nil)
        
        notificationCenter.add(request)
    }
    
    @objc func showNotifications() {
        // Create notifications view controller
        let notificationsVC = UIViewController()
        notificationsVC.view.backgroundColor = .systemBackground
        
        // Create table view
        let tableView = UITableView()
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "NotificationCell")
        notificationsVC.view.addSubview(tableView)
        
        NSLayoutConstraint.activate([
            tableView.leadingAnchor.constraint(equalTo: notificationsVC.view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: notificationsVC.view.trailingAnchor),
            tableView.topAnchor.constraint(equalTo: notificationsVC.view.topAnchor),
            tableView.bottomAnchor.constraint(equalTo: notificationsVC.view.bottomAnchor)
        ])
        
        // Set up table view
        tableView.delegate = self
        tableView.dataSource = self
        
        // Create navigation bar
        let navBar = UINavigationBar()
        navBar.translatesAutoresizingMaskIntoConstraints = false
        notificationsVC.view.addSubview(navBar)
        
        NSLayoutConstraint.activate([
            navBar.topAnchor.constraint(equalTo: notificationsVC.view.safeAreaLayoutGuide.topAnchor),
            navBar.leadingAnchor.constraint(equalTo: notificationsVC.view.leadingAnchor),
            navBar.trailingAnchor.constraint(equalTo: notificationsVC.view.trailingAnchor),
            navBar.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        let navItem = UINavigationItem(title: "Notifications")
        let clearButton = UIBarButtonItem(title: "Clear All", style: .plain, target: self, action: #selector(clearNotifications))
        navItem.rightBarButtonItem = clearButton
        navBar.setItems([navItem], animated: false)
        
        // Present notifications
        let navController = UINavigationController(rootViewController: notificationsVC)
        navController.modalPresentationStyle = .formSheet
        present(navController, animated: true)
    }
    
    @objc func clearNotifications() {
        // Implement clearing notifications
        print("Clearing all notifications")
    }
    
    // MARK: - UITableViewDataSource
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // Return number of notifications
        return 5 // Temporary value
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "NotificationCell", for: indexPath)
        cell.textLabel?.text = "New Song Available"
        cell.detailTextLabel?.text = "Your favorite artist has released a new song!"
        cell.accessoryType = .disclosureIndicator
        return cell
    }
    
    // MARK: - UITableViewDelegate
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        // Handle notification tap
        print("Notification tapped at row \(indexPath.row)")
    }
    
    func tableView(_ tableView: UITableView, commit editingStyle: UITableViewCell.EditingStyle, forRowAt indexPath: IndexPath) {
        if editingStyle == .delete {
            // Delete notification
            print("Deleting notification at row \(indexPath.row)")
        }
    }
    
    @objc func previousSong() {
        // Implement previous song logic
        print("Previous song tapped")
    }
    
    @objc func playPause() {
        // Implement play/pause logic
        print("Play/Pause tapped")
        let isPlaying = playPauseButton.currentImage == UIImage(systemName: "pause.fill")
        playPauseButton.setImage(UIImage(systemName: isPlaying ? "play.fill" : "pause.fill"), for: .normal)
    }
    
    @objc func nextSong() {
        // Implement next song logic
        print("Next song tapped")
    }
    
    @objc func toggleRepeat() {
        // Implement repeat toggle logic
        print("Repeat toggled")
        // Update repeat button image based on state
    }
    
    @objc func toggleShuffle() {
        // Implement shuffle toggle logic
        print("Shuffle toggled")
        // Update shuffle button image based on state
    }
    
    @objc func showQueue() {
        // Create queue view controller
        let queueVC = UIViewController()
        queueVC.view.backgroundColor = .systemBackground
        
        // Create table view
        let tableView = UITableView()
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "QueueCell")
        queueVC.view.addSubview(tableView)
        
        NSLayoutConstraint.activate([
            tableView.leadingAnchor.constraint(equalTo: queueVC.view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: queueVC.view.trailingAnchor),
            tableView.topAnchor.constraint(equalTo: queueVC.view.topAnchor),
            tableView.bottomAnchor.constraint(equalTo: queueVC.view.bottomAnchor)
        ])
        
        // Set up table view
        tableView.delegate = self
        tableView.dataSource = self
        
        // Create navigation bar
        let navBar = UINavigationBar()
        navBar.translatesAutoresizingMaskIntoConstraints = false
        queueVC.view.addSubview(navBar)
        
        NSLayoutConstraint.activate([
            navBar.topAnchor.constraint(equalTo: queueVC.view.safeAreaLayoutGuide.topAnchor),
            navBar.leadingAnchor.constraint(equalTo: queueVC.view.leadingAnchor),
            navBar.trailingAnchor.constraint(equalTo: queueVC.view.trailingAnchor),
            navBar.heightAnchor.constraint(equalToConstant: 44)
        ])
        
        let navItem = UINavigationItem(title: "Queue")
        let clearButton = UIBarButtonItem(title: "Clear", style: .plain, target: self, action: #selector(clearQueue))
        navItem.rightBarButtonItem = clearButton
        navBar.setItems([navItem], animated: false)
        
        // Present queue
        let navController = UINavigationController(rootViewController: queueVC)
        navController.modalPresentationStyle = .formSheet
        present(navController, animated: true)
    }
    
    @objc func clearQueue() {
        // Implement clearing queue
        print("Clearing queue")
    }
    
    @objc func toggleFavorite() {
        // Implement favorite toggle logic
        print("Favorite toggled")
        // Update favorite button image based on state
    }
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        activityIndicator.startAnimating()
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityIndicator.stopAnimating()
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        showAlert(title: "Error", message: error.localizedDescription)
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        activityIndicator.stopAnimating()
        showAlert(title: "Error", message: error.localizedDescription)
    }
    
    func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}
}
