import Foundation
import CoreImage
import Vision

struct ProjectFile: Decodable { let href: String; let qr: String; let title: String }
let base = "https://shabyt.vercel.app"
let cwd = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let files = try JSONDecoder().decode([ProjectFile].self, from: Data(contentsOf: cwd.appendingPathComponent("content/project-files.json")))
let entries = files.map { (base + $0.href, "public" + $0.qr, $0.title) } + [(base + "/", "public/qr-codes/shabyt-website.png", "Shabyt сайты")]
let context = CIContext(options: [.useSoftwareRenderer: true])
for (url, output, title) in entries {
    let filter = CIFilter(name: "CIQRCodeGenerator")!
    filter.setValue(Data(url.utf8), forKey: "inputMessage")
    filter.setValue("M", forKey: "inputCorrectionLevel")
    let qr = filter.outputImage!
    let scale: CGFloat = 20
    let border: CGFloat = 80
    let size = qr.extent.width * scale + border * 2
    let code = qr.transformed(by: CGAffineTransform(scaleX: scale, y: scale)).transformed(by: CGAffineTransform(translationX: border, y: border))
    let canvas = CIImage(color: CIColor.white).cropped(to: CGRect(x: 0, y: 0, width: size, height: size))
    let result = code.composited(over: canvas)
    guard let image = context.createCGImage(result, from: result.extent) else { fatalError("Cannot render QR") }
    let request = VNDetectBarcodesRequest()
    try VNImageRequestHandler(cgImage: image).perform([request])
    guard request.results?.contains(where: { $0.payloadStringValue == url }) == true else { fatalError("QR verification failed: \(title)") }
    let data = context.pngRepresentation(of: result, format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())!
    try data.write(to: cwd.appendingPathComponent(output))
    print("Verified: \(title)")
}
let links = entries.map { "\($0.2)\n\($0.0)" }.joined(separator: "\n\n")
try links.write(to: cwd.appendingPathComponent("public/qr-codes/links.txt"), atomically: true, encoding: .utf8)
