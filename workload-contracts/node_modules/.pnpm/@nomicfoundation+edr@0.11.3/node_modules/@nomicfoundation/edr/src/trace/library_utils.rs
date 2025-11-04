use napi_derive::napi;

#[napi]
pub fn link_hex_string_bytecode(
    code: String,
    address: String,
    position: u32,
) -> napi::Result<String> {
    edr_solidity::library_utils::link_hex_string_bytecode(code, &address, position)
        .map_err(|err| napi::Error::from_reason(err.to_string()))
}
