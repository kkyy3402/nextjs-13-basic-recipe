# nextjs-13-basic-recipe
Next.js 13 나왔길래 변경된 내용 정리하는 레포


companion object {
    /**
     * Request code for onActivityResult for when the user wants to pick an image
     * in the WebFragment
     */
    const val REQUEST_SELECT_FILE_IN_WEB_FRAGMENT = 328
}

/**
 * Used by [WebFragment] to upload photos to
 * the WebView. To do this, we need to catch onActivityResult after the user
 * selected the photo and pass it onto the WebView using this ValueCallback.
 */
private var uploadMessageReceiver: ValueCallback<Array<Uri>>? = null

override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)

    if (requestCode == REQUEST_SELECT_FILE_IN_WEB_FRAGMENT) {
        // This request was triggered from a webpage in WebFragment to select/upload a picture.
        // tell the uploadMessageReceiver about the selected image data and set it to null again.
        if (uploadMessageReceiver == null) return
        uploadMessageReceiver?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data))
        uploadMessageReceiver = null
    }
}

// implemenation of the interface defined in WebFragment
override fun getMessageReceiver(): ValueCallback<Array<Uri>>? {
    return uploadMessageReceiver
}

// implemenation of the interface defined in WebFragment
override fun setMessageReceiver(callback: ValueCallback<Array<Uri>>?) {
    uploadMessageReceiver = callback
}

//2222



private lateinit var uploadReceiver: UploadMessageReceiver

override fun onAttach(context: Context) {
    super.onAttach(context)
    when (context) {
        is UploadMessageReceiver -> uploadReceiver = context
        else -> throw IllegalArgumentException("Attached context must implement UploadMessageReceiver to allow image uploading in this WebView.")
    }
}

override fun onViewCreated(view: View, savedInstanceState: Bundle?) {


    with(binding.webView) {
        webViewClient = WebViewClient()
        webChromeClient = BvbWebChromeClient()
        settings.javaScriptEnabled = true
        settings.allowFileAccess = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.setAppCacheEnabled(true)

        if (savedInstanceState == null) {
            loadUrl(arguments.url)
        }
    }
}


/**
 * Let the attached Activity implement this interface to catch the
 * onActivityResult after the user selected an image to upload (see [BvbWebChromeClient])
 */
interface UploadMessageReceiver {
    fun getMessageReceiver(): ValueCallback<Array<Uri>>?
    fun setMessageReceiver(callback: ValueCallback<Array<Uri>>?)
}

/**
 * This WebChromeClient is needed to allow the user to select an image that
 * he/she wants to upload to a web page.
 */
inner class BvbWebChromeClient : WebChromeClient() {

    /**
     * Used by the HTML Feedback form to upload an image.
     * Works tightly with [MainActivity.uploadMessageReceiver]
     */
    override fun onShowFileChooser(webView: WebView, filePathCallback: ValueCallback<Array<Uri>>, fileChooserParams: FileChooserParams): Boolean {
        // make sure there is no existing message
        val uploadMessage = uploadReceiver.getMessageReceiver()
        if (uploadMessage != null) {
            uploadMessage.onReceiveValue(null)
            uploadReceiver.setMessageReceiver(null)
        }
        uploadReceiver.setMessageReceiver(filePathCallback)
        val intent = fileChooserParams.createIntent()
        try {
            requireActivity().startActivityForResult(intent, MainActivity.REQUEST_SELECT_FILE_IN_WEB_FRAGMENT)
        } catch (e: ActivityNotFoundException) {
            uploadReceiver.setMessageReceiver(null)
            Toast.makeText(requireActivity(), "Cannot open file chooser", Toast.LENGTH_LONG).show()
            return false
        }
        return true
    }
}
